# แผนปรับปรุง Rent a car API

เอกสารนี้สรุปสถานะปัจจุบันและแนวทางปรับปรุง backend (Rent a car/api) ด้าน Auth, สิทธิ์ และความสอดคล้องกับ frontend

---

## 1. สถานะปัจจุบัน

### 1.1 Authentication
- **JwtAuthGuard** (global): ตรวจ JWT ทุก route ยกเว้นที่ใส่ `@Public()`
- **JwtStrategy**: อ่าน token จาก `Authorization: Bearer <token>` → โหลด user จาก DB → ใส่ใน `request.user`
- **Auth controller**: `POST /v1/auth/login` ใช้ `@Public()` แล้ว คืน `{ type: 'bearer', token }` — ตรงกับ frontend
- **GET /v1/auth**: ต้องมี JWT (session) — ตรงกับ frontend

### 1.2 Authorization (สิทธิ์)
- **PermissionsGuard** (global): อ่าน metadata `@Permission(...)` จาก handler
  - ถ้าไม่มี `@Permission()` → ผ่าน (ทุก user ที่ login แล้วใช้ได้)
  - ถ้ามี → ตรวจ `user.role` ต้องเป็นหนึ่งในรายการที่ระบุ หรือเป็น `SUPERADMIN`
- **User**: มี `role?: string` (เช่น ADMIN, STAFF)
- **สถานะ**: Controller ส่วนใหญ่ (customer, booking, car, return-inspection) **ยังไม่ใส่ @Permission()** จึงเท่ากับ “เข้าถึงได้ทุกคนที่ login”

### 1.3 การใช้ current user ใน handler
- **file.controller**: ใช้ `req.user?.id` เป็น `createdById` แล้ว
- **booking**: ใช้ `body.createdById` จาก client (ไม่บังคับจาก token)
- **customer create/update/approve**: ไม่ได้ส่ง `createdBy`/`updatedBy` เข้า use case

### 1.4 อื่นๆ
- CORS ตั้ง `allowedHeaders: ['Content-Type', 'Authorization']` แล้ว
- Throttler ใช้แล้ว (global)
- ValidationPipe ใช้แล้ว (global)
- Swagger มี addBearerAuth() แล้ว

---

## 2. ปัญหาที่เคยเกิดและแนวทางป้องกัน

| ปัญหา | สาเหตุ | แนวทาง (ทำแล้ว/ควรทำ) |
|--------|--------|-------------------------|
| 401 ที่ /v1/customer ขณะ /v1/auth ผ่าน | Frontend ไม่แนบ Authorization ใน request บางตัว | แก้ฝั่ง frontend: สร้าง api instance เฉพาะบน client และใส่ Bearer token ใน onRequest (ทำแล้ว) |
| 401 “no user (token invalid or user not found)” | ไม่มี header หรือ token ผิด/หมดอายุ หรือ user ถูกลบใน DB | ฝั่ง API: มี log ใน JwtAuthGuard/JwtStrategy แล้ว; ฝั่ง frontend ต้องแนบ token ทุก request ที่ต้อง auth |

---

## 3. แผนปรับปรุง (เรียงตามความสำคัญ)

### Phase 1: เสถียรภาพ Auth และการใช้ current user (แนะนำทำก่อน)

1. **เพิ่ม decorator สำหรับ current user**
   - สร้าง `@User()` หรือ `@LoggedInUser()` ใน `src/common/decorators/` ให้ return `request.user`
   - ใช้ใน controller แทนการอ่าน `req.user` ตรงๆ เพื่อให้ type ชัดและใช้ซ้ำได้

2. **บังคับใช้ user ที่ login เป็นผู้สร้าง/แก้ไข**
   - **Customer**: ส่ง `createdBy`/`updatedBy` จาก `request.user` เข้า use case create/update/approve (ไม่รับจาก body) และเก็บใน DB ถ้า schema รองรับ
   - **Booking**: พิจารณาบังคับ `createdById = req.user.id` จาก token แทนการรับจาก body (ลดการปลอมได้)
   - **File**: ใช้ `req.user?.id` เป็น `createdById` อยู่แล้ว — เหลือแค่ให้แน่ใจว่า route ต้องผ่าน JwtAuthGuard

3. **ตรวจสอบ route ที่ควรเป็น Public**
   - ตรวจว่ามีเฉพาะ login (และถ้ามี health check / webhook) ที่ใส่ `@Public()`
   - route อื่น (auth session, customer, booking, car, return-inspection, file ฯลฯ) ไม่ใส่ `@Public()` เพื่อให้ต้อง login ทุกจุด

### Phase 2: กำหนดสิทธิ์ (Role / Permission)

4. **กำหนด role ให้ชัด**
   - กำหนดค่า `role` ที่ใช้จริงในระบบ (เช่น `ADMIN`, `STAFF`, `SUPERADMIN`) และเก็บในตาราง user
   - อัปเดต seed/migration ถ้ามี เพื่อให้ user มี role ที่สอดคล้อง

5. **ใส่ @Permission() ใน controller**
   - ใช้รูปแบบ “อนุญาต role ใดบ้าง” เช่น `@Permission('ADMIN', 'STAFF')` ตาม PermissionsGuard ปัจจุบัน
   - ตัวอย่าง:
     - **customer**: ดู list/get = `ADMIN`, `STAFF`; create/update/approve = `ADMIN` (หรือตามที่ธุรกิจกำหนด)
     - **booking**: ดู/สร้าง/แก้ไข = กำหนด role ให้ตรงกับนโยบาย
     - **car, return-inspection, file**: กำหนด role ให้สอดคล้อง
   - route ที่ต้องจำกัดเฉพาะแอดมินสูงสุดใช้ `@Permission('SUPERADMIN')` หรือ role ที่ออกแบบไว้

6. **ปรับ PermissionsGuard (ถ้าต้องการละเอียดขึ้น)**
   - ปัจจุบัน: ตรวจ `user.role` กับรายการใน `@Permission(...)` (เทียบเท่า “allowed roles”)
   - ถ้าอนาคตต้องการ permission แบบละเอียด (เช่น `customer.view`, `customer.create`) ค่อยเพิ่มโครง permission ใน user/role แล้วให้ Guard ตรวจจากโครงนั้น

### Phase 3: การดำเนินการและความปลอดภัย

7. **Logging และการดีบัก 401**
   - ลด log level ของข้อความ 401 ใน production ถ้าไม่จำเป็น (หรือใช้ request ID เพื่อตาม trace)
   - พิจารณาแยก log “ไม่มี token” กับ “token ผิด/หมดอายุ/ไม่พบ user” เพื่อวิเคราะห์ปัญหาได้เร็ว

8. **CORS และ environment**
   - ใน production ตั้ง `origin` เป็นรายการ domain จริง (ไม่ใช้ `true`)
   - เก็บ `JWT_SECRET` ใน env เท่านั้น และไม่ commit ค่าใน repo

9. **เอกสาร API**
   - ใน Swagger ใส่คำอธิบายว่า route ใดต้อง Bearer token และ (ถ้ามี) ต้อง role อะไร
   - อัปเดตเมื่อเพิ่ม/เปลี่ยน @Permission()

---

## 4. ลำดับการทำที่แนะนำ

1. สร้าง `@User()` (หรือ `@LoggedInUser()`) และใช้ใน controller ที่ต้องใช้ current user  
2. ปรับ customer (และถ้าต้องการ booking) ให้ใช้ user จาก token เป็น createdBy/updatedBy  
3. กำหนด role ในระบบ (และใน DB) แล้วค่อยใส่ @Permission() ที่ customer, booking, car, return-inspection, file  
4. ตรวจ route ทั้งหมดว่าไม่มี endpoint ที่ควรเป็น private แต่เผลอใส่ @Public()  
5. ปรับ logging / CORS / docs ตาม Phase 3  

เมื่อทำครบ Phase 1 และ 2 ระบบจะ “ต้องเป็น user ที่เข้าสู่ระบบ” และ “มีการกำหนดสิทธิ์ตาม role” ชัดเจน และสอดคล้องกับแนวทางที่ใช้ใน texcel-api (Guard + decorator + ใช้ user ใน handler)
