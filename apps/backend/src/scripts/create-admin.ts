import bcrypt from "bcryptjs";
import {pool, closePool} from "../lib/db.js";

const admin_user= process.env.admin_username ?? "admin";
const admin_email = process.env.admin_email ?? "admin@admin.com";
const admin_password = process.env.admin_password ?? "admin000";
const admin_phone = process.env.admin_phone ?? "01700000000";

async function main(){
    if(!admin_user || !admin_email || !admin_password || !admin_phone) {
        throw new Error("Admin credentials are not set in environment variables");
    }
    if(admin_password.length < 8) throw new Error("Admin password must be at least 8 characters long");
    const hashedPassword = await bcrypt.hash(admin_password, 12);
    const existing_user= await pool.query(
        `SELECT user_id, username, phone, role FROM users WHERE username = $1 OR email = $2 LIMIT 1`,
        [admin_user, admin_email],
    );
    if(existing_user.rowCount && existing_user.rowCount>0){
        const user= existing_user.rows[0];
        if(user.role !== "admin") throw new Error(`User with username ${admin_user} or email ${admin_email} already exists but is not an admin`);
        console.log(`Admin user already exists: ${user.username} (${user.phone})`);
        await closePool();
        return;
    }
    const result=await pool.query(
        `INSERT INTO users (username, email, phone, password_hash, role, account_status, email_verified)
        VALUES ($1, $2, $3, $4, 'admin', 'active', true) 
        RETURNING user_id, username, email, role, account_status`,
        [admin_user, admin_email, admin_phone, hashedPassword],
    );
    const admin=result.rows[0];
    console.log(`Admin user created: ${admin.username} (${admin.email})`);
    console.log(`Admin credentials: username=${admin_user}, email=${admin_email}, userid=${admin.user_id}`);
    await closePool();
}

main().catch(async(err)=>{
    console.error("Error creating admin user:", err);
    await closePool();
    process.exit(1);
})
/*
$env:admin_user="admin"
$env:admin_email="admin@shohojrin.local"
$env:admin_phone="01700000000"
$env:admin_password="adminnimda"
*/
