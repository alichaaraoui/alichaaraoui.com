# 📸 Celine Project - Image Setup Guide

## Folder Structure
Create this folder structure in your project:

```
react-portfolio/
└── public/
    └── images/
        ├── aia-logo-white.png          # Your AIA Award logo (white version)
        └── celine/                     # All your Celine project images
            ├── paper-models.jpg        # Paper models section image
            ├── surface-tectonics.jpg   # Surface tectonics section image
            ├── architectural-form.jpg  # Architectural form section image
            ├── structure-details.jpg   # Structure details section image
            ├── gallery-01.jpg          # Additional gallery images
            ├── gallery-02.jpg
            ├── gallery-03.jpg
            └── ... (add as many as you want)
```

## Image Naming
- **Specific section images**: Use exact names listed above
- **Gallery images**: Can be named anything (01.jpg, 02.jpg, etc.)
- **Supported formats**: .jpg, .jpeg, .png, .webp

## What Happens Automatically
✅ **AIA Logo**: 
   - Inverts to black in light mode
   - Stays white in dark mode
   - Shows next to "AIA Advanced Design Award" text

✅ **Section Images**:
   - Paper Models section - uses paper-models.jpg
   - Surface Tectonics section - uses surface-tectonics.jpg
   - Architectural Form section - uses architectural-form.jpg
   - Structure Details section - uses structure-details.jpg

✅ **Gallery**: 
   - All images in `/public/images/celine/` folder will show at the bottom
   - Automatically responsive and styled

## Adding Images
1. Place your AIA logo at: `react-portfolio/public/images/aia-logo-white.png`
2. Create folder: `react-portfolio/public/images/celine/`
3. Add your images with the names listed above
4. Refresh your browser - images will load automatically!

## Tips
- Use high-quality images (recommended width: 1200-2000px)
- Keep file sizes reasonable (<5MB per image)
- Use consistent aspect ratios for gallery images
- Name files clearly for easy management

## Need to Add More Gallery Images?
Just drop them in the `/public/images/celine/` folder - no code changes needed!

