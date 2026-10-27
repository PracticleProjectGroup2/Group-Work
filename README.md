# JINF

> Practical assignment completed as a group. <!-- TODO: add a one-line description of what JINF stands for / does -->

JINF is a web application made up of a backend API and a frontend. Users can register and log in, manage items, submit claims on items, and every important action is recorded in an audit log.

## Features

- User authentication (register / login)
- Item management with item statuses and item reports
- Claims on items
- Audit logging of key actions
- Database constraints (for example, unique email addresses)

## Project Structure

```
Group-Work/
├── .github/                       # GitHub configuration
├── JINF.Api/                      # Backend API (.NET)
├── JINF.Web/                      # Frontend
├── JINF.sln                       # Visual Studio solution
├── JINF_Constraints_Tests.sql     # Script to test database constraints
├── JINF_Constraints_Audit.sql     # Script to audit database constraints
├── jinf.ERD.drawio.png            # Entity Relationship Diagram
└── DBConnectionStringCheck.png    # Connection string reference
```

## Tech Stack

- **Backend:** C# / .NET Web API
- **Frontend:** <!-- TODO: e.g. React / Angular / Blazor -->
- **Database:** <!-- TODO: e.g. SQL Server -->

## Getting Started

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) <!-- TODO: add version -->
- A database server <!-- TODO: e.g. SQL Server -->
- Git
- <!-- TODO: Node.js, if the frontend needs it -->

### 1. Clone the repository

```bash
git clone https://github.com/PracticleProjectGroup2/Group-Work.git
cd Group-Work
```

### 2. Set up the database

1. Create a new empty database.
2. Update the connection string in `JINF.Api/appsettings.json` (see `DBConnectionStringCheck.png` for an example):

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

3. Apply the database schema <!-- TODO: e.g. `dotnet ef database update` -->.
4. (Optional) Run `JINF_Constraints_Tests.sql` to verify the database constraints.

### 3. Run the API

```bash
cd JINF.Api
dotnet restore
dotnet run
```

The API will start on the URL shown in the terminal. <!-- TODO: add default URL / Swagger path -->

### 4. Run the frontend

```bash
cd JINF.Web
# TODO: add install and start commands, e.g.
# npm install
# npm start
```

Make sure the frontend is pointed at the running API URL.

## Database

The database design is shown in `jinf.ERD.drawio.png`. The SQL scripts in the root folder are used to test and audit constraints such as unique emails.

## Contributing

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit with a clear message (for example `feat: add item search`).
3. Push your branch and open a Pull Request into `main`.
4. Wait for a teammate to review and merge it.

## Team

- [Vehan-Kuhn](https://github.com/Vehan-Kuhn)
- [B-Judels](https://github.com/B-Judels) (Bernard)
- [Sammie](https://github.com/Sammie453)
- [Vehan-Kuhn](https://github.com/Vehan-Kuhm)
- <!-- TODO: add the third contributor and yourself -->
