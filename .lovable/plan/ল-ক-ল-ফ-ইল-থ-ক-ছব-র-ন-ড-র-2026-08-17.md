# লোকাল ফাইল থেকে ছবি রেন্ডার

সব ছবি (লোগো + ৯টি মাউসপ্যাড ডিজাইন) প্রজেক্টের ভেতরে লোকাল ফাইল হিসেবে থাকবে এবং সেখান থেকেই রেন্ডার হবে। ডাটাবেস বা CDN থেকে কোনো ছবি লোড হবে না।

## যা করা হবে

1. আপলোড করা ১০টি ফাইল `src/assets/` এ কপি করা হবে (আসল বাইনারি ফাইল, কোনো CDN পয়েন্টার নয়):
   - `logo.jpg` → `src/assets/um-logo.jpg`
   - `design-blood-moon-samurai.webp`
   - `Cyclops_Blast_Premium.webp` → `design-cyclops-blast.webp`
   - `INTERFACE_Black.webp` → `design-interface-black.webp`
   - `INTERFACE_White.webp` → `design-interface-white.webp`
   - `PC_Parts_Matrix_Blue.webp` → `design-matrix-blue.webp`
   - `PC_Parts_Matrix_White.webp` → `design-matrix-white.webp`
   - `Midnight_Galaxy.webp` → `design-midnight-galaxy.webp`
   - `Neon_City.webp` → `design-neon-city.webp`
   - `Time_Traveller_Astronaut_Premium.webp` → `design-time-traveller.webp`

2. নতুন ফাইল `src/lib/product-images.ts` — প্রতিটি প্রোডাক্ট কোড অনুযায়ী লোকাল ইমপোর্টের ম্যাপ। প্রোডাক্টের ছবি এখান থেকেই আসবে; ডাটাবেসের `image_url` আর ব্যবহার হবে না (কোনো কোড ম্যাচ না পেলে শুধু তখনই ফলব্যাক)।

3. `OrderForm.tsx` (ডিজাইন গ্রিড + সিলেক্টেড প্রিভিউ) এবং `Logo.tsx` লোকাল ছবি ব্যবহার করবে।

4. ফেভিকন লোগো থেকে স্কয়ার করে `public/favicon.png` হিসেবে সেট হবে।

5. পুরোনো CDN পয়েন্টার ফাইলগুলো (`src/assets/*.asset.json`, ব্যবহার-না-হওয়া ভিডিও/পোস্টার সহ) মুছে ফেলা হবে।

## যা অপরিবর্তিত থাকবে

- দাম, নাম, ডিসকাউন্ট, ডেলিভারি চার্জ আগের মতোই ডাটাবেস/অ্যাডমিন প্যানেল থেকে নিয়ন্ত্রিত হবে।
- অর্ডার, অ্যাডমিন ড্যাশবোর্ড, রেট লিমিট — কোনো পরিবর্তন নেই।

## টেকনিক্যাল নোট

- Vite ইমেজ ইমপোর্ট ব্যবহার হবে (`import img from "@/assets/x.webp"`), তাই ছবি বিল্ডে হ্যাশড ও অপটিমাইজড হয়ে বান্ডলের সাথেই সার্ভ হবে — অন্য হোস্টে নিলেও কাজ করবে।
- অ্যাডমিন ক্যাটালগ পেজে ইমেজ আপলোড/URL ফিল্ড থাকবে, কিন্তু সাইটে লোকাল ম্যাপের ছবি অগ্রাধিকার পাবে; চাইলে পরে ফিল্ডটি সরিয়ে দেওয়া যাবে।
