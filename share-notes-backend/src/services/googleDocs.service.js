import { google } from "googleapis";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getKeyFilePath = () => {
  const pathEnv = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
  if (pathEnv && existsSync(pathEnv)) {
    return pathEnv;
  }

  const altPath = join(__dirname, "..", "service-account.json");
  if (existsSync(altPath)) {
    return altPath;
  }

  return null;
};

const getServiceAccountAuth = async () => {
  const keyFile = getKeyFilePath();

  if (keyFile) {
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });
    return await auth.getClient();
  }

  const envJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!envJson) {
    throw new Error(
      "Google Docs no está configurado en el servidor. " +
      "Crea src/service-account.json o define GOOGLE_SERVICE_ACCOUNT_JSON/GOOGLE_SERVICE_ACCOUNT_PATH"
    );
  }

  const credentials = JSON.parse(envJson);
  const auth = google.auth.fromJSON({
    type: "service_account",
    client_email: credentials.client_email,
    private_key: credentials.private_key,
    private_key_id: credentials.private_key_id,
    project_id: credentials.project_id,
  });
  auth.scopes = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
  ];

  return auth;
};

const getUserAuth = (accessToken, refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || null,
  });
  return oauth2Client;
};

export const createGoogleDoc = async (title, content, collaboratorEmails = [], userAccessToken = null, userRefreshToken = null) => {
  if (!title && !content) {
    throw new Error("La nota está vacía. Escribe algo antes de exportar a Google Docs.");
  }

  const auth = userAccessToken
    ? getUserAuth(userAccessToken, userRefreshToken)
    : await getServiceAccountAuth();

  const drive = google.drive({ version: "v3", auth });

  let file;
  try {
    file = await drive.files.create({
      requestBody: {
        name: title || "Nota de Share Notes",
        mimeType: "application/vnd.google-apps.document",
      },
      fields: "id, webViewLink",
    });
  } catch (e) {
    console.error("Error al crear Google Doc:", JSON.stringify(e?.response?.data || e.message));
    throw new Error(
      "Error al crear el documento en Google Docs: " +
      (e?.response?.data?.error?.message || e.message)
    );
  }

  const docId = file.data.id;
  const docUrl = file.data.webViewLink || `https://docs.google.com/document/d/${docId}/edit`;

  if (content) {
    const docs = google.docs({ version: "v1", auth });
    try {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    } catch (e) {
      console.error("Error al insertar contenido:", e?.response?.data || e.message);
    }
  }

  for (const email of collaboratorEmails) {
    try {
      await drive.permissions.create({
        fileId: docId,
        requestBody: {
          type: "user",
          role: "writer",
          emailAddress: email,
        },
      });
    } catch (err) {
      console.error(`Error compartiendo Google Doc con ${email}:`, err.message);
    }
  }

  return {
    documentId: docId,
    url: docUrl,
  };
};
