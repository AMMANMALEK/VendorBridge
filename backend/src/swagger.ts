import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VendorBridge ERP API',
      version: '1.0.0',
      description: 'Procurement & Vendor Management ERP API Documentation'
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}`, description: 'Development server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/swaggerDocs.ts']
};

export default swaggerJsdoc(options);
