# Student Hub Architecture 
Student Hub is a React frontend backed by a Rails API. 

## Architecture 
React ↓ 
Rails API ↓ 
PostgreSQL 
Docker is used for local infrastructure. 
The backend is a modular monolith rather than microservices.

## Main domains
- Users / Profiles 
- Projects 
- Discovery 
- Likes 
- Matches 
- Messaging 

## Principles 
- Keep domain boundaries clear. 
- Prefer simple architecture. 
- Do not introduce infrastructure without a requirement. 
- Authorization is enforced by the backend. 
- Frontend code should not contain secrets.