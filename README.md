<img width="1888" height="832" alt="image" src="https://github.com/user-attachments/assets/c486c51e-11b0-473c-947b-cb4b862535e2" />

<img width="1907" height="828" alt="image" src="https://github.com/user-attachments/assets/ebadc9f0-d86a-4b13-a87b-1e715d79de27" />

<img width="1866" height="814" alt="image" src="https://github.com/user-attachments/assets/c3937c03-c8e4-4ff7-8ef6-1be2a6acbf33" />

<img width="1887" height="822" alt="image" src="https://github.com/user-attachments/assets/941ec4fc-5b9e-45a0-9aa3-0e278f857ab3" />

## Meridian Kitchens demo

The local stack runs the React frontend, FastAPI backend, PostgreSQL source of truth, and Mongo guest-preferences store with Docker Compose:

```bash
docker compose up --build
```

Open `http://localhost:5173`. Demo accounts are seeded on first startup:

| Role | Email | Password | Scope |
| --- | --- | --- | --- |
| Staff | `staff1@meridian.com` | `staff123` | Chickpet outlet |
| Staff | `staff2@meridian.com` | `staff123` | Whitefield outlet |
| Staff | `staff3@meridian.com` | `staff123` | Trinity outlet |
| Staff | `staff4@meridian.com` | `staff123` | Indiranagar outlet |
| Manager | `manager@meridian.com` | `manager123` | All outlets |

Staff inventory, dashboard, and reorder reads are scoped to the signed-in staff member's outlet. Managers can review pending reorder requests and approve them. The browser communicates only with the backend; database credentials stay inside the Compose network.


