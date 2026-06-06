/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         email: { type: string }
 *         role: { type: string, enum: [officer, vendor, manager, admin] }
 *         company: { type: string }
 *         phone: { type: string }
 *         isActive: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *     Vendor:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         companyName: { type: string }
 *         contactPerson: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         address: { type: string }
 *         category: { type: string, enum: [raw_materials, services, technology, logistics, consulting, other] }
 *         gstNumber: { type: string }
 *         status: { type: string, enum: [active, inactive, blacklisted] }
 *         rating: { type: number }
 *         totalOrders: { type: number }
 *         totalSpent: { type: number }
 *     RFQ:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         title: { type: string }
 *         description: { type: string }
 *         items: { type: array, items: { $ref: '#/components/schemas/RFQItem' } }
 *         status: { type: string, enum: [draft, sent, closed, cancelled] }
 *         deadline: { type: string, format: date-time }
 *         createdBy: { $ref: '#/components/schemas/User' }
 *         assignedVendors: { type: array, items: { $ref: '#/components/schemas/RFQVendor' } }
 *     RFQItem:
 *       type: object
 *       properties:
 *         productName: { type: string }
 *         description: { type: string }
 *         quantity: { type: number }
 *         unit: { type: string }
 *         estimatedPrice: { type: number }
 *     RFQVendor:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         vendor: { $ref: '#/components/schemas/Vendor' }
 *     Quotation:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         rfq: { $ref: '#/components/schemas/RFQ' }
 *         vendor: { $ref: '#/components/schemas/Vendor' }
 *         items: { type: array, items: { $ref: '#/components/schemas/QuotationItem' } }
 *         subtotal: { type: number }
 *         taxAmount: { type: number }
 *         grandTotal: { type: number }
 *         deliveryTimeline: { type: string }
 *         notes: { type: string }
 *         status: { type: string, enum: [submitted, revised, accepted, rejected] }
 *     QuotationItem:
 *       type: object
 *       properties:
 *         productName: { type: string }
 *         quantity: { type: number }
 *         unitPrice: { type: number }
 *         totalPrice: { type: number }
 *     Approval:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         quotation: { $ref: '#/components/schemas/Quotation' }
 *         rfq: { $ref: '#/components/schemas/RFQ' }
 *         vendor: { $ref: '#/components/schemas/Vendor' }
 *         status: { type: string, enum: [pending, approved, rejected] }
 *         approvedBy: { $ref: '#/components/schemas/User' }
 *         remarks: { type: string }
 *         reviewedAt: { type: string, format: date-time }
 *     PurchaseOrder:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         poNumber: { type: string }
 *         quotation: { $ref: '#/components/schemas/Quotation' }
 *         vendor: { $ref: '#/components/schemas/Vendor' }
 *         items: { type: array, items: { $ref: '#/components/schemas/QuotationItem' } }
 *         subtotal: { type: number }
 *         taxAmount: { type: number }
 *         grandTotal: { type: number }
 *         status: { type: string, enum: [generated, sent, acknowledged, completed, cancelled] }
 *     Invoice:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         invoiceNumber: { type: string }
 *         purchaseOrder: { $ref: '#/components/schemas/PurchaseOrder' }
 *         vendor: { $ref: '#/components/schemas/Vendor' }
 *         items: { type: array, items: { $ref: '#/components/schemas/QuotationItem' } }
 *         subtotal: { type: number }
 *         taxAmount: { type: number }
 *         grandTotal: { type: number }
 *         status: { type: string, enum: [generated, sent, paid, overdue, cancelled] }
 *         dueDate: { type: string, format: date-time }
 *     Notification:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         type: { type: string }
 *         title: { type: string }
 *         message: { type: string }
 *         isRead: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *     Activity:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         type: { type: string }
 *         action: { type: string }
 *         description: { type: string }
 *         user: { $ref: '#/components/schemas/User' }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [officer, vendor, manager, admin] }
 *               company: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error }
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: Reset link sent }
 */

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password with token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200: { description: Password reset successful }
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Current user data }
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of users }
 */

/**
 * @swagger
 * /api/v1/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Dashboard summary data }
 */

/**
 * @swagger
 * /api/v1/dashboard/analytics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get analytics data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Analytics data }
 */

/**
 * @swagger
 * /api/v1/vendors:
 *   post:
 *     tags: [Vendors]
 *     summary: Create a new vendor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *     responses:
 *       201: { description: Vendor created }
 *   get:
 *     tags: [Vendors]
 *     summary: Get all vendors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of vendors }
 */

/**
 * @swagger
 * /api/v1/vendors/{id}:
 *   get:
 *     tags: [Vendors]
 *     summary: Get vendor by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vendor data }
 *   put:
 *     tags: [Vendors]
 *     summary: Update vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *     responses:
 *       200: { description: Vendor updated }
 *   delete:
 *     tags: [Vendors]
 *     summary: Delete vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vendor deleted }
 */

/**
 * @swagger
 * /api/v1/vendors/{id}/quotations:
 *   get:
 *     tags: [Vendors]
 *     summary: Get quotations by vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Quotations by vendor }
 */

/**
 * @swagger
 * /api/v1/rfqs:
 *   post:
 *     tags: [RFQs]
 *     summary: Create a new RFQ
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, deadline]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               items: { type: array, items: { $ref: '#/components/schemas/RFQItem' } }
 *               deadline: { type: string, format: date-time }
 *               assignedVendors: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: RFQ created }
 *   get:
 *     tags: [RFQs]
 *     summary: Get all RFQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of RFQs }
 */

/**
 * @swagger
 * /api/v1/rfqs/{id}:
 *   get:
 *     tags: [RFQs]
 *     summary: Get RFQ by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: RFQ data }
 *   put:
 *     tags: [RFQs]
 *     summary: Update RFQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RFQ'
 *     responses:
 *       200: { description: RFQ updated }
 */

/**
 * @swagger
 * /api/v1/rfqs/{id}/quotations:
 *   get:
 *     tags: [RFQs]
 *     summary: Get quotations for an RFQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Quotations for RFQ }
 */

/**
 * @swagger
 * /api/v1/rfqs/{id}/compare:
 *   get:
 *     tags: [RFQs]
 *     summary: Compare quotations for an RFQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Quotation comparison }
 */

/**
 * @swagger
 * /api/v1/rfqs/{id}/attachments:
 *   post:
 *     tags: [RFQs]
 *     summary: Upload attachment to RFQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: Attachment uploaded }
 */

/**
 * @swagger
 * /api/v1/rfqs/{id}/vendors:
 *   post:
 *     tags: [RFQs]
 *     summary: Assign vendors to RFQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vendorIds]
 *             properties:
 *               vendorIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Vendors assigned }
 */

/**
 * @swagger
 * /api/v1/quotations:
 *   post:
 *     tags: [Quotations]
 *     summary: Submit a quotation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rfqId, vendorId, items, subtotal, grandTotal]
 *             properties:
 *               rfqId: { type: string }
 *               vendorId: { type: string }
 *               items: { type: array, items: { $ref: '#/components/schemas/QuotationItem' } }
 *               subtotal: { type: number }
 *               taxAmount: { type: number }
 *               grandTotal: { type: number }
 *               deliveryTimeline: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Quotation submitted }
 */

/**
 * @swagger
 * /api/v1/quotations/{id}:
 *   put:
 *     tags: [Quotations]
 *     summary: Update a quotation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quotation'
 *     responses:
 *       200: { description: Quotation updated }
 */

/**
 * @swagger
 * /api/v1/approvals/pending:
 *   get:
 *     tags: [Approvals]
 *     summary: Get pending approvals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Pending approvals }
 */

/**
 * @swagger
 * /api/v1/approvals/{quotationId}/approve:
 *   post:
 *     tags: [Approvals]
 *     summary: Approve a quotation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quotationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks: { type: string }
 *     responses:
 *       200: { description: Quotation approved }
 */

/**
 * @swagger
 * /api/v1/approvals/{quotationId}/reject:
 *   post:
 *     tags: [Approvals]
 *     summary: Reject a quotation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quotationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks: { type: string }
 *     responses:
 *       200: { description: Quotation rejected }
 */

/**
 * @swagger
 * /api/v1/purchase-orders:
 *   get:
 *     tags: [Purchase Orders]
 *     summary: Get all purchase orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of purchase orders }
 */

/**
 * @swagger
 * /api/v1/purchase-orders/{id}:
 *   get:
 *     tags: [Purchase Orders]
 *     summary: Get purchase order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Purchase order data }
 */

/**
 * @swagger
 * /api/v1/purchase-orders/generate/{quotationId}:
 *   post:
 *     tags: [Purchase Orders]
 *     summary: Generate purchase order from quotation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quotationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Purchase order generated }
 */

/**
 * @swagger
 * /api/v1/invoices/generate/{poId}:
 *   post:
 *     tags: [Invoices]
 *     summary: Generate invoice from purchase order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Invoice generated }
 */

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     tags: [Invoices]
 *     summary: Get invoice by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Invoice data }
 */

/**
 * @swagger
 * /api/v1/invoices/{id}/pdf:
 *   get:
 *     tags: [Invoices]
 *     summary: Download invoice as PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: PDF file }
 */

/**
 * @swagger
 * /api/v1/invoices/{id}/email:
 *   post:
 *     tags: [Invoices]
 *     summary: Send invoice via email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Invoice emailed }
 */

/**
 * @swagger
 * /api/v1/invoices/{id}/print:
 *   get:
 *     tags: [Invoices]
 *     summary: Print invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Invoice printable PDF }
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of notifications }
 */

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification marked as read }
 */

/**
 * @swagger
 * /api/v1/activities:
 *   get:
 *     tags: [Activities]
 *     summary: Get activity logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [RFQ, QUOTATION, APPROVAL, PURCHASE_ORDER, INVOICE, VENDOR, USER] }
 *     responses:
 *       200: { description: List of activities }
 */

/**
 * @swagger
 * /api/v1/reports/procurement-summary:
 *   get:
 *     tags: [Reports]
 *     summary: Get procurement summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Procurement summary data }
 */

/**
 * @swagger
 * /api/v1/reports/vendor-performance:
 *   get:
 *     tags: [Reports]
 *     summary: Get vendor performance analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Vendor performance data }
 */

/**
 * @swagger
 * /api/v1/reports/monthly-trends:
 *   get:
 *     tags: [Reports]
 *     summary: Get monthly procurement trends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Monthly trends data }
 */

/**
 * @swagger
 * /api/v1/reports/export:
 *   get:
 *     tags: [Reports]
 *     summary: Export procurement report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema: { type: string, enum: [pdf, excel] }
 *     responses:
 *       200: { description: Exported file }
 */
