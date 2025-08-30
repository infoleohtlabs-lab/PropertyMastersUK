import * as React from 'react';
import { cn } from '../../utils';
import { User, Camera } from 'lucide-react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  border?: boolean;
  loading?: boolean;
  editable?: boolean;
  onEdit?: () => void;
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    src, 
    alt, 
    fallback, 
    size = 'md', 
    shape = 'circle',
    status,
    showStatus = false,
    border = false,
    loading = false,
    editable = false,
    onEdit,
    ...props 
  }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
      '2xl': 'h-20 w-20 text-xl',
    };

    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const statusClasses = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
      '2xl': 'h-5 w-5',
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    const displayFallback = !src || imageError || !imageLoaded;
    const fallbackText = fallback || alt?.charAt(0)?.toUpperCase() || '';

    const handleClick = () => {
      if (editable && onEdit) {
        onEdit();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden bg-gray-100',
          sizeClasses[size],
          shapeClasses[shape],
          border && 'ring-2 ring-white shadow-sm',
          editable && 'cursor-pointer transition-transform hover:scale-105',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
          </div>
        ) : (
          <>
            {src && !imageError && (
              <img
                src={src}
                alt={alt}
                className={cn(
                  'aspect-square h-full w-full object-cover transition-opacity duration-200',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
            {displayFallback && (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-medium">
                {fallbackText || <User className="h-1/2 w-1/2" />}
              </div>
            )}
            {editable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <Camera className="h-1/3 w-1/3 text-white" />
              </div>
            )}
          </>
        )}
        
        {showStatus && status && (
          <div className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusSizes[size],
            statusClasses[status]
          )} />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => {
      setImageLoaded(false);
      setImageError(false);
    }, [src]);

    if (!src || imageError) {
      return null;
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(
          'aspect-square h-full w-full object-cover',
          imageLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };