import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AgentsService } from './agents.service';
import { Agent } from './entities/agent.entity';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create agent profile' })
  @ApiResponse({ status: 201, description: 'Agent profile created successfully', schema: { $ref: getSchemaPath(Agent) } })
  create(@Body() createAgentDto: any) {
    return this.agentsService.create(createAgentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all agents' })
  @ApiResponse({ status: 200, description: 'Agents retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Agent) } } })
  findAll() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  @ApiResponse({ status: 200, description: 'Agent retrieved successfully', schema: { $ref: getSchemaPath(Agent) } })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get agent profile by user ID' })
  @ApiResponse({ status: 200, description: 'Agent profile retrieved successfully', schema: { $ref: getSchemaPath(Agent) } })
  @ApiResponse({ status: 404, description: 'Agent profile not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.agentsService.findByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update agent profile' })
  @ApiResponse({ status: 200, description: 'Agent profile updated successfully', schema: { $ref: getSchemaPath(Agent) } })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  update(@Param('id') id: string, @Body() updateAgentDto: any) {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete agent profile' })
  @ApiResponse({ status: 200, description: 'Agent profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  remove(@Param('id') id: string) {
    return this.agentsService.remove(id);
  }
}
