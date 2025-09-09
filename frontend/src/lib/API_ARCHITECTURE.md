# API Architecture Documentation

## Overview

The API layer has been refactored from a monolithic `BackendApiClient` god object into a clean, use case-driven architecture following SOLID principles.

## Architecture

### 1. Core Components

#### `HttpClient` (`/lib/http-client.ts`)
- **Purpose**: Low-level HTTP communication
- **Responsibilities**: 
  - Making HTTP requests to backend services
  - Handling query parameters and headers
  - Basic response handling

#### `RequestUtils` (`/lib/request-utils.ts`)
- **Purpose**: Request processing utilities
- **Responsibilities**:
  - Body extraction and validation
  - Query parameter extraction
  - Field validation
  - Pagination validation
  - Error response creation

### 2. Use Cases

#### `StandardApiUseCase` (`/lib/use-cases/standard-api.ts`)
- **Purpose**: Handle standard authenticated API requests
- **Usage**: Most API endpoints that require authentication
- **Features**:
  - Automatic authorization header handling
  - Standard error handling
  - Consistent response format

#### `AuthUseCases` (`/lib/use-cases/auth.ts`)
- **Purpose**: Handle authentication-specific operations
- **Methods**:
  - `login()`: Token-based login with cookie handling
  - `register()`: User registration (no auth required)
  - `logout()`: Authenticated logout
  - `refresh()`: Token refresh using cookies
- **Features**:
  - Special token response handling
  - Cookie management
  - JWT validation for refresh tokens

### 3. Legacy Compatibility

#### `BackendApiClient` (`/lib/backend-api.ts`)
- **Status**: Deprecated but maintained for backward compatibility
- **Purpose**: Facade pattern - delegates to new use cases
- **Migration**: Gradually replace with specific use cases

## Usage Examples

### Standard API Endpoints

```typescript
// Before (using BackendApiClient)
import { BackendApiClient } from '@/lib/backend-api';

export async function POST(req: Request) {
    const bodyResult = await BackendApiClient.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    return BackendApiClient.request(req, '/SomeEndpoint', {
        method: 'POST',
        body: bodyResult.data,
    });
}

// After (using StandardApiUseCase)
import { StandardApiUseCase } from '@/lib/use-cases/standard-api';
import { RequestUtils } from '@/lib/request-utils';

export async function POST(req: Request) {
    const bodyResult = await RequestUtils.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    return StandardApiUseCase.execute(req, '/SomeEndpoint', {
        method: 'POST',
        body: bodyResult.data,
    });
}
```

### Authentication Endpoints

```typescript
// Login
import { AuthUseCases } from '@/lib/use-cases/auth';
import { RequestUtils } from '@/lib/request-utils';

export async function POST(req: Request) {
    const bodyResult = await RequestUtils.extractBody(req);
    if (!bodyResult.success) return bodyResult.response;
    
    return AuthUseCases.login(req, bodyResult.data as { identity: string; password: string });
}

// Refresh
export async function POST(req: Request) {
    return AuthUseCases.refresh(req);
}
```

## Benefits

### 1. **Single Responsibility Principle**
- Each class has one clear purpose
- `HttpClient`: HTTP communication
- `RequestUtils`: Request processing
- `StandardApiUseCase`: Standard API handling
- `AuthUseCases`: Authentication handling

### 2. **Maintainability**
- Easier to find and modify specific functionality
- Clear separation of concerns
- Better testability

### 3. **Extensibility**
- Easy to add new use cases (e.g., `FileUploadUseCase`, `NotificationUseCase`)
- Can customize behavior per use case
- No impact on existing functionality

### 4. **Type Safety**
- Better TypeScript support
- Specific interfaces for each use case
- Clearer method signatures

### 5. **Backward Compatibility**
- Existing code continues to work
- Gradual migration path
- No breaking changes

## Migration Guide

### Immediate Actions (Optional)
1. **New endpoints**: Use specific use cases instead of `BackendApiClient`
2. **Auth endpoints**: Already migrated to `AuthUseCases`

### Future Improvements
1. **Migrate existing endpoints**: Replace `BackendApiClient.request()` with `StandardApiUseCase.execute()`
2. **Add new use cases** as needed (file uploads, real-time, etc.)
3. **Remove deprecated methods** once migration is complete

### Adding New Use Cases

```typescript
// Example: File Upload Use Case
export class FileUploadUseCase {
  static async uploadFile(req: Request, file: File): Promise<NextResponse> {
    // Specific file upload logic
    // Different headers (multipart/form-data)
    // Progress tracking
    // Size validation
  }
}
```

## File Structure

```
src/lib/
├── http-client.ts          # Core HTTP communication
├── request-utils.ts        # Request processing utilities
├── backend-api.ts          # Legacy compatibility layer (deprecated)
└── use-cases/
    ├── index.ts           # Barrel exports
    ├── standard-api.ts    # Standard authenticated requests
    └── auth.ts           # Authentication operations
```

This architecture provides a solid foundation for scaling the API layer while maintaining clean, testable, and maintainable code.
