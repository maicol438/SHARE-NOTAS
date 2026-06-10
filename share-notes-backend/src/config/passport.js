import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const initializeGoogleAuth = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    console.log('⚠️ Google OAuth no configurado — omitiendo estrategia');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('Email no encontrado en perfil de Google'));

          // Intentar obtener mode del state OAuth (puede ser consumido por Passport internamente)
          let mode = null;
          if (req.query.state) {
            try {
              const decoded = JSON.parse(Buffer.from(req.query.state, 'base64').toString('ascii'));
              mode = decoded.mode;
            } catch (e) {
              console.error('Error al decodificar state de Google OAuth:', e);
            }
          }
          // Fallback: leer mode desde cookie (más confiable que el state de OAuth)
          if (!mode && req.cookies?.oauth_mode) {
            mode = req.cookies.oauth_mode;
          }

          console.log(`🔐 Google OAuth - email: ${email}, mode from state: ${mode}, hasCookie: ${!!req.cookies?.oauth_mode}, hasQueryState: ${!!req.query.state}`);

          let user = await User.findOne({ email });

          if (!user) {
            // Si el modo es 'login', no creamos el usuario automáticamente
            if (mode === 'login') {
              return done(null, false, { message: 'account_not_found' });
            }

            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              authProvider: 'google',
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
            });
            req.isNewGoogleUser = true;
          } else {
            // Si el modo es 'register' y el usuario ya existe, bloqueamos el registro duplicado
            if (mode === 'register') {
              return done(null, false, { message: 'account_exists' });
            }

            // Si ya existe, vinculamos su googleId y avatar si no están presentes
            if (!user.googleId) {
              user.googleId = profile.id;
            }
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            
            user.googleAccessToken = accessToken;
            if (refreshToken) user.googleRefreshToken = refreshToken;
            
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
