import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../config/db.js';
import { hashPassword, verifyPassword, generateToken, getAuthenticatedUser } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function formatNameFromEmail(email) {
  if (!email) return 'User';
  const namePart = email.split('@')[0];
  return namePart
    .split(/[._-]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export async function login(req, res, next) {
  try {
    const db = getDb();
    const { email, phone, password, role } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ success: false, error: 'Please enter your email address or mobile number.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: 'Please enter your password.' });
    }

    const user = await db.collection('users').findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });

    // Standardized failure response to prevent user enumeration and guarantee security requirements 2 & 3
    if (!user) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
    }

    if (!user.passwordHash || user.passwordHash === '') {
      // First-time website password registration for this existing account (e.g. Google OAuth)
      const { hash, salt } = hashPassword(password);
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { passwordHash: hash, salt, lastLogin: new Date() } }
      );
      user.passwordHash = hash;
      user.salt = salt;
    } else {
      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
      }
    }

    const updates = { lastLogin: new Date() };
    if (role && role !== user.role) updates.role = (role === 'SELLER' || role === 'OWNER') ? 'SELLER' : 'BUYER';
    await db.collection('users').updateOne({ _id: user._id }, { $set: updates });

    const token = generateToken(user);
    const userRole = user.role === 'SELLER' || user.role === 'OWNER' ? 'SELLER' : 'BUYER';
    const userId = user.userId || String(user._id);

    res.json({
      success: true,
      authenticated: true,
      token,
      userId,
      user: {
        id: userId,
        userId,
        fullName: user.fullName || user.name,
        name: user.name || user.fullName,
        email: user.email,
        phone: user.phone || '',
        role: userRole,
        intent: user.intent || (userRole === 'SELLER' ? 'SELL' : 'BUY'),
        location: user.location || '',
        profilePhoto: user.avatarUrl || user.profilePhoto || ''
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function signup(req, res, next) {
  try {
    const db = getDb();
    const { email, phone, name, password, confirmPassword, role, intent } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address or mobile number.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required to create an account.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match. Please verify your password entries.' });
    }

    const existingUser = await db.collection('users').findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });

    if (existingUser) {
      if (!existingUser.passwordHash || existingUser.passwordHash === '') {
        const { hash, salt } = hashPassword(password);
        const userDisplayName = name?.trim() || existingUser.name || formatNameFromEmail(cleanEmail);
        const userRole = (role === 'SELLER' || role === 'OWNER') ? 'SELLER' : (existingUser.role || 'BUYER');
        await db.collection('users').updateOne(
          { _id: existingUser._id },
          {
            $set: {
              name: userDisplayName,
              fullName: userDisplayName,
              passwordHash: hash,
              salt,
              role: userRole,
              updatedAt: new Date(),
              lastLogin: new Date()
            }
          }
        );
        const updated = { ...existingUser, name: userDisplayName, role: userRole, passwordHash: hash, salt };
        const token = generateToken(updated);
        const userId = updated.userId || String(updated._id);
        return res.status(201).json({
          success: true,
          authenticated: true,
          token,
          userId,
          user: {
            id: userId,
            userId,
            fullName: userDisplayName,
            name: userDisplayName,
            email: updated.email,
            phone: updated.phone || '',
            role: userRole,
            intent: updated.intent || (userRole === 'SELLER' ? 'SELL' : 'BUY')
          }
        });
      }

      return res.status(409).json({
        success: false,
        error: 'This email is already registered. Please sign in or click "Forgot Password?" to reset your password.'
      });
    }

    const { hash, salt } = hashPassword(password);
    const userDisplayName = name?.trim() || formatNameFromEmail(cleanEmail);
    const uniqueUserId = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const userRole = (role === 'SELLER' || role === 'OWNER') ? 'SELLER' : 'BUYER';

    const newUser = {
      userId: uniqueUserId,
      id: uniqueUserId,
      name: userDisplayName,
      fullName: userDisplayName,
      email: cleanEmail,
      phone: cleanPhone || '',
      passwordHash: hash,
      salt: salt,
      role: userRole,
      intent: intent || (userRole === 'SELLER' ? 'SELL' : 'BUY'),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    };

    await db.collection('users').insertOne(newUser);

    if (userRole === 'BUYER') {
      await db.collection('buyer_profiles').updateOne(
        { userId: uniqueUserId },
        {
          $set: {
            userId: uniqueUserId,
            buyerId: uniqueUserId,
            name: userDisplayName,
            email: cleanEmail,
            phone: cleanPhone,
            intent: 'BUY',
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    } else {
      await db.collection('seller_profiles').updateOne(
        { userId: uniqueUserId },
        {
          $set: {
            userId: uniqueUserId,
            sellerId: uniqueUserId,
            name: userDisplayName,
            email: cleanEmail,
            phone: cleanPhone,
            ownerType: 'OWNER',
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    }

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      authenticated: true,
      token,
      userId: uniqueUserId,
      user: {
        id: uniqueUserId,
        userId: uniqueUserId,
        fullName: userDisplayName,
        name: userDisplayName,
        email: cleanEmail,
        phone: cleanPhone || '',
        role: userRole,
        intent: newUser.intent
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const db = getDb();
    const { email } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Please enter your registered email address.' });
    }

    const user = await db.collection('users').findOne({ email: cleanEmail });
    if (!user) {
      // For security, return success message without revealing email existence
      return res.json({
        success: true,
        message: 'If this email is registered, password reset instructions have been generated.'
      });
    }

    const resetToken = `rst-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour token validity

    await db.collection('password_resets').updateOne(
      { email: cleanEmail },
      {
        $set: {
          email: cleanEmail,
          userId: user.userId,
          resetToken,
          expiresAt,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      resetToken,
      message: `Password reset instructions sent for ${cleanEmail}. Use your reset token to set a new website password.`
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const db = getDb();
    const { email, resetToken, newPassword, confirmPassword } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanToken = (resetToken || '').trim();

    if (!cleanEmail || !cleanToken) {
      return res.status(400).json({ success: false, error: 'Email address and reset token are required.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New website password must be at least 6 characters long.' });
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const resetRecord = await db.collection('password_resets').findOne({
      email: cleanEmail,
      resetToken: cleanToken
    });

    if (!resetRecord || new Date() > new Date(resetRecord.expiresAt)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token. Please request a new link.' });
    }

    const { hash, salt } = hashPassword(newPassword);

    await db.collection('users').updateOne(
      { email: cleanEmail },
      { $set: { passwordHash: hash, salt: salt, updatedAt: new Date() } }
    );

    await db.collection('password_resets').deleteOne({ _id: resetRecord._id });

    res.json({
      success: true,
      message: 'Website password reset successfully! You can now log in with your new website password.'
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const authUser = await getAuthenticatedUser(req, req.query);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'Unauthenticated: User session not found.' });
    }
    const userId = authUser.userId || String(authUser._id);
    res.json({
      success: true,
      user: {
        id: userId,
        userId: userId,
        fullName: authUser.fullName || authUser.name,
        name: authUser.name || authUser.fullName,
        email: authUser.email,
        phone: authUser.phone || '',
        role: authUser.role,
        intent: authUser.intent,
        location: authUser.location || '',
        bio: authUser.bio || '',
        avatarUrl: authUser.avatarUrl || authUser.profilePhoto || ''
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) {
      return res.status(401).json({ success: false, error: '401 Unauthenticated: Please log in to update profile.' });
    }

    const updates = { updatedAt: new Date() };
    if (req.body.name !== undefined) {
      updates.name = req.body.name.trim();
      updates.fullName = req.body.name.trim();
    }
    if (req.body.location !== undefined) updates.location = req.body.location.trim();
    if (req.body.phone !== undefined) updates.phone = req.body.phone.trim();
    if (req.body.bio !== undefined) updates.bio = req.body.bio.trim();
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = req.body.avatarUrl;
    if (req.body.profilePhoto !== undefined) updates.profilePhoto = req.body.profilePhoto;

    await db.collection('users').updateOne({ _id: authUser._id }, { $set: updates });
    const updatedUser = { ...authUser, ...updates };

    const userId = authUser.userId;
    if (authUser.role === 'BUYER') {
      await db.collection('buyer_profiles').updateOne(
        { userId },
        {
          $set: {
            userId,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    } else {
      await db.collection('seller_profiles').updateOne(
        { userId },
        {
          $set: {
            userId,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            location: updatedUser.location,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      user: {
        id: userId,
        userId,
        fullName: updatedUser.fullName || updatedUser.name,
        name: updatedUser.name || updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        location: updatedUser.location || '',
        bio: updatedUser.bio || '',
        avatarUrl: updatedUser.avatarUrl || updatedUser.profilePhoto || ''
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) {
      return res.status(401).json({ success: false, error: '401 Unauthenticated: Log in required to upload profile photo.' });
    }

    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided.' });
    }

    let ext = 'jpg';
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      const header = parts[0];
      cleanBase64 = parts[1];
      if (header.includes('png')) ext = 'png';
      else if (header.includes('webp')) ext = 'webp';
      else if (header.includes('jpeg') || header.includes('jpg')) ext = 'jpg';
    } else if (mimeType) {
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    const filename = `avatar_${authUser.userId}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);
    const avatarUrl = `/uploads/avatars/${filename}`;

    await db.collection('users').updateOne(
      { _id: authUser._id },
      { $set: { avatarUrl, profilePhoto: avatarUrl, updatedAt: new Date() } }
    );
    if (authUser.role === 'BUYER') {
      await db.collection('buyer_profiles').updateOne({ userId: authUser.userId }, { $set: { profilePhoto: avatarUrl } });
    } else {
      await db.collection('seller_profiles').updateOne({ userId: authUser.userId }, { $set: { profilePhoto: avatarUrl } });
    }

    res.json({
      success: true,
      avatarUrl,
      user: {
        id: authUser.userId,
        userId: authUser.userId,
        fullName: authUser.fullName || authUser.name,
        email: authUser.email,
        avatarUrl
      }
    });
  } catch (err) {
    next(err);
  }
}
