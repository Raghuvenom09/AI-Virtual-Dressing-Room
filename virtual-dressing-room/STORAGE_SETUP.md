# 🖼️ Image Storage Setup Guide

## ✅ What Was Added

### 1. **Supabase Storage Functions** (`src/supabase.js`)
- `uploadTryOnResult()` - Saves try-on results to cloud storage
- `getUserGallery()` - Retrieves user's past try-ons
- `deleteTryOnResult()` - Removes images from storage

### 2. **Gallery Component** (`src/components/TryOnGallery.jsx`)
- View all past try-on results
- Download individual images
- Delete unwanted results
- Auto-refresh functionality

### 3. **Backend Support** (`backend/tryon_api.py`)
- Now accepts `user_id` parameter
- Returns user_id for tracking

### 4. **Auto-Save Feature** (`src/components/VirtualTryOnAI.jsx`)
- Automatically saves results to Supabase after successful try-on
- Works silently in background (won't show errors if storage fails)

---

## 🚀 Setup Instructions

### Step 1: Configure Supabase Storage

1. **Go to Supabase Dashboard** → https://app.supabase.com
2. **Navigate to SQL Editor**
3. **Copy contents of `supabase-setup.sql`**
4. **Paste and click "RUN"**

This will:
- ✅ Create `tryon-results` storage bucket
- ✅ Create `tryon_history` database table
- ✅ Set up security policies (users can only see their own images)
- ✅ Add automatic cleanup (keeps last 50 results per user)

### Step 2: Verify Setup

**Check Storage:**
- Go to **Storage** → Should see `tryon-results` bucket

**Check Database:**
- Go to **Table Editor** → Should see `tryon_history` table

### Step 3: Access Gallery

**Frontend Routes:**
- Gallery: `http://localhost:3000/gallery`
- Or add a navigation link in your app

---

## 📁 How It Works

### Storage Structure
```
tryon-results/
├── user-abc123/
│   ├── tryon-1732800000000.jpg
│   ├── tryon-1732800120000.jpg
│   └── tryon-1732800240000.jpg
├── user-xyz789/
│   └── tryon-1732800360000.jpg
```

### Database Schema
```sql
tryon_history
├── id (UUID)
├── user_id (UUID) → References auth.users
├── image_url (TEXT) → Public URL
├── file_path (TEXT) → Storage path
├── clothing_type (TEXT) → e.g., "shirt"
├── clothing_color (TEXT) → e.g., "black"
├── created_at (TIMESTAMP)
└── metadata (JSONB) → Additional data
```

---

## 🔧 Usage

### User Flow:
1. User uploads person + clothing image
2. Clicks "Process Try-On"
3. **Backend generates result**
4. **Frontend automatically saves to Supabase** (if logged in)
5. User can view in Gallery at `/gallery`

### Guest Users:
- If not logged in, results are NOT saved
- Only temporary display
- Login required for persistent storage

---

## 🛡️ Security Features

✅ **Row-Level Security (RLS)** enabled
- Users can only see their own images
- Cannot delete others' images

✅ **Storage Policies**
- Authenticated users only
- User-specific folders

✅ **Auto-Cleanup**
- Keeps last 50 results per user
- Prevents unlimited storage growth

---

## 🧪 Testing

### Test the Complete Flow:

1. **Start Backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend:**
   ```bash
   cd virtual-dressing-room
   npm run dev
   ```

3. **Login** (or create account)

4. **Try Virtual Try-On:**
   - Upload images
   - Process try-on
   - Check console for "✅ Result saved to gallery"

5. **Visit Gallery:**
   - Go to `/gallery`
   - Should see your result
   - Test download & delete

---

## 🐛 Troubleshooting

### Images not saving?
- Check console for errors
- Verify Supabase credentials in `.env`
- Confirm SQL setup was run
- Make sure user is logged in

### Gallery not showing images?
- Check Network tab for API errors
- Verify bucket is public
- Check RLS policies are correct

### Storage quota exceeded?
- Free tier: 1GB
- Run cleanup function manually
- Upgrade to paid plan

---

## 📊 Storage Limits

**Supabase Free Tier:**
- Storage: 1GB
- Bandwidth: 2GB/month
- ~2,000 images (assuming 500KB each)

**Recommendations:**
- Compress images before upload
- Auto-delete old results
- Upgrade for production use

---

## 🎯 Next Steps (Optional)

- [ ] Add image compression before upload
- [ ] Implement pagination in gallery
- [ ] Add search/filter by clothing type
- [ ] Share feature (generate public links)
- [ ] Download multiple images as ZIP
- [ ] Compare side-by-side (before/after)

---

## 📝 Environment Variables

Make sure these are in your `.env`:

```env
# Supabase
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

# Backend
HF_TOKEN=your-token
```

---

## ✅ Summary

You now have:
- ✅ Persistent cloud storage for try-on results
- ✅ User gallery to browse past try-ons
- ✅ Automatic saving after each try-on
- ✅ Download & delete functionality
- ✅ Secure, user-specific storage
- ✅ No errors in existing code

**Everything is backwards compatible** - if storage fails, the app still works normally!
