# MELO-v2 Development Setup Guide

## Prerequisites

### System Requirements
- Node.js: Version 20.x or higher
- pnpm: Version 8.x or higher
- Git: Latest version recommended
- Operating System: Linux, macOS, or Windows (WSL2 recommended)

#### Installing Prerequisites
```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm@8
```

## Clone and Install

### Repository Setup
```bash
# Clone the repository
git clone https://github.com/your-org/melo-v2.git
cd melo-v2

# Install dependencies
pnpm install
```

## Environment Variable Setup

### Creating .env File
Create a `.env` file in the project root with the following variables:

```env
# Matrix Connection
MATRIX_HOMESERVER=https://matrix.dev2.example.com
MATRIX_USER_ID=@your_username:dev2.example.com
MATRIX_ACCESS_TOKEN=your_matrix_access_token

# Optional Development Flags
MELO_DEBUG=true
MELO_LOG_LEVEL=debug
```

#### Obtaining Matrix Credentials
1. Log in to the Matrix dev2 server
2. Generate an access token from your account settings
3. Copy the access token into the `.env` file

## Running the Development Server

### Start Development Mode
```bash
# Run the development server
pnpm dev

# Alternative: start specific services
pnpm dev:web    # Start web application
pnpm dev:matrix # Start Matrix-specific services
```

### Available Scripts
- `pnpm dev`: Start all services in development mode
- `pnpm build`: Compile the project
- `pnpm test`: Run test suite
- `pnpm lint`: Run code linting

## Connecting to Matrix (dev2)

### Connection Verification
1. Ensure your `.env` file is correctly configured
2. Run `pnpm dev:matrix` to start Matrix services
3. Check logs for successful connection:
   ```
   Matrix connection established: @your_username:dev2.example.com
   ```

## Troubleshooting Common Issues

### Node.js Version Conflicts
- **Symptom**: Installation fails due to incompatible Node.js version
- **Solution**: 
  ```bash
  # Ensure correct Node.js version
  nvm install 20
  nvm use 20
  pnpm install
  ```

### Matrix Connection Errors
- **Symptom**: Unable to connect to Matrix
- **Checklist**:
  1. Verify access token
  2. Check homeserver URL
  3. Ensure network connectivity
  4. Validate `.env` file permissions

### Dependency Installation Problems
- **Symptom**: `pnpm install` fails
- **Solutions**:
  ```bash
  # Clear pnpm cache
  pnpm store prune

  # Force reinstall dependencies
  rm -rf node_modules
  pnpm install
  ```

## Additional Resources
- Project Documentation: [Link to full docs]
- Issue Tracker: [Link to GitHub Issues]
- Contributing Guidelines: [Link to CONTRIBUTING.md]

## Getting Help
- Open a GitHub Issue
- Contact maintainers on Matrix: #melo-dev channel