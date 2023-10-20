# Stylish Web

## Deployment

1. Start MySQL server
2. Import database: `mysql -u <user_name> -p <db_name> < backup.sql`
3. Create config: `.env` for back-end (You can copy the schema from template: `.env-template`)
4. Install server dependencies `npm install`
5. Create admin role and user: `npm run db:seeds initAdmin.js`
6. Start a redis server in `localhost` at port `6379`
7. Clear redis campaign cache
8. Start queue (Optional)
9. Clear Browser localStorage or cookies if needed. The same address will use the same space to records localStorage key-value pairs and it may conflict with mine. (Optional)

### Run Develop Server
```
npm run dev
```

### Run Production Sever
```
npm run build
npm run start
```

### Run Queue
```
npm run queue
```
