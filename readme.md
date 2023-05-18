# Stylish Web

### Deployment

1. Start MySQL server
2. Import database: `mysql -u <user_name> -p <db_name> < stylish_backend.sql`
3. Create config: `.env` for back-end (You can copy the schema from template: `.env-template`)
4. Create admin role and user: `npm run db:seeds initAdmin.js`
5. Start a redis server in `localhost` at port `6379`
6. Start server:
  1. Install server dependencies
  2. `npm run dev`
7. Build server: `npm run build`
8. Start queue (Optional)
9. Clear Browser localStorage if needed. The same address will use the same space to records localStorage key-value pairs and it may conflict with mine. (Optional)
