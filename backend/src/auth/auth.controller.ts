import { Controller, Post, Body, UseGuards, Request, Get, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody,
  ApiSecurity,
  getSchemaPath
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RateLimit } from './decorators/rate-limit.decorator';
import { RateLimitWindow } from './decorators/rate-limit-window.decorator';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ValidateResetTokenDto,
} from './dto/auth.dto';
import { ApiSuccessResponse, ApiErrorResponse } from '../common/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(RateLimitGuard, AuthGuard('local'))
  @RateLimit(5)
  @RateLimitWindow(15 * 60 * 1000) // 15 minutes
  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT access token and refresh token.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'User login credentials'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'JWT access token (expires in 15 minutes)'
                },
                refreshToken: {
                  type: 'string',
                  example: 'refresh_token_here',
                  description: 'Refresh token (expires in 7 days)'
                },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                    email: { type: 'string', example: 'user@example.com' },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    role: { type: 'string', example: 'tenant' },
                    isEmailVerified: { type: 'boolean', example: true }
                  }
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    type: ApiErrorResponse
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many login attempts. Rate limit exceeded.',
    type: ApiErrorResponse
  })
  async login(@Request() req) {
    return this.authService.login(req.user, req);
  }

  @UseGuards(RateLimitGuard)
  @RateLimit(3)
  @RateLimitWindow(60 * 60 * 1000) // 1 hour
  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account. Email verification required before login.'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'User registration details'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully. Verification email sent.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Registration successful. Please check your email to verify your account.'
                },
                userId: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error or email already exists',
    type: ApiErrorResponse
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many registration attempts',
    type: ApiErrorResponse
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  @RateLimit(3)
  @RateLimitWindow(60 * 60 * 1000) // 1 hour
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset email to user. Always returns success for security.'
  })
  @ApiBody({ 
    type: ForgotPasswordDto,
    description: 'Email address for password reset'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent (if email exists)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'If an account with this email exists, a password reset link has been sent.'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many password reset requests',
    type: ApiErrorResponse
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @UseGuards(RateLimitGuard)
  @RateLimit(5)
  @RateLimitWindow(60 * 60 * 1000) // 1 hour
  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Reset password with token',
    description: 'Reset user password using a valid reset token from email.'
  })
  @ApiBody({ 
    type: ResetPasswordDto,
    description: 'Reset token and new password'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Password has been reset successfully. You can now login with your new password.'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired reset token',
    type: ApiErrorResponse
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many password reset attempts',
    type: ApiErrorResponse
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }



  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token.'
  })
  @ApiBody({ 
    type: RefreshTokenDto,
    description: 'Valid refresh token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'New access token generated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'New JWT access token'
                },
                expiresIn: {
                  type: 'number',
                  example: 900,
                  description: 'Token expiration time in seconds'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired refresh token',
    type: ApiErrorResponse
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Patch('change-password')
  @UseGuards(TenantAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Change user password',
    description: 'Change password for authenticated user. Requires current password verification.'
  })
  @ApiBody({ 
    type: ChangePasswordDto,
    description: 'Current and new password'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Password changed successfully.'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid current password or validation error',
    type: ApiErrorResponse
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or expired token',
    type: ApiErrorResponse
  })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  @Post('logout')
  @UseGuards(TenantAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logout authenticated user and invalidate refresh tokens.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Logout successful.'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or expired token',
    type: ApiErrorResponse
  })
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @Post('verify-email')
  @ApiOperation({ 
    summary: 'Verify email address',
    description: 'Verify user email address using verification token from email.'
  })
  @ApiBody({ 
    type: VerifyEmailDto,
    description: 'Email verification token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Email verified successfully. You can now login.'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired verification token',
    type: ApiErrorResponse
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('validate-reset-token')
  @ApiOperation({ 
    summary: 'Validate password reset token',
    description: 'Check if a password reset token is valid and not expired.'
  })
  @ApiBody({ 
    type: ValidateResetTokenDto,
    description: 'Reset token to validate'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                valid: {
                  type: 'boolean',
                  example: true,
                  description: 'Whether the token is valid'
                },
                expiresAt: {
                  type: 'string',
                  example: '2025-01-15T12:00:00Z',
                  description: 'Token expiration time'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired token',
    type: ApiErrorResponse
  })
  async validateResetToken(@Body() validateResetTokenDto: ValidateResetTokenDto) {
    return this.authService.validateResetToken(validateResetTokenDto.token);
  }

  @Post('resend-verification')
  @UseGuards(TenantAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Resend email verification',
    description: 'Resend email verification link to authenticated user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification email sent',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Verification email sent. Please check your inbox.'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or expired token',
    type: ApiErrorResponse
  })
  async resendVerification(@Request() req) {
    return this.authService.resendVerificationEmail(req.user.userId);
  }
}