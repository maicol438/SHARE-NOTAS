import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Share Notes API",
      version: "1.0.0",
      description:
        "API REST para la plataforma Share Notes – gestión de notas académicas por categorías.",
      contact: { name: "Share Notes Team" },
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            color: { type: "string" },
            user: { type: "string", description: "ObjectId del usuario" },
          },
        },
        Note: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            category: { type: "string", description: "ObjectId de la categoría" },
            user: { type: "string", description: "ObjectId del usuario" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📖 Swagger disponible en /api-docs");
};
