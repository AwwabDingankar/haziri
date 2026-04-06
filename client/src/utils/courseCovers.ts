/**
 * Returns a deterministic, unique cover image URL for a course based on its ID.
 * 16-image curated Unsplash palette across Study, Books, Science, Art themes.
 * The same course ID always maps to the same image.
 * A custom cover_image_url from the DB always takes priority.
 */
const COVER_PALETTE = [
  // Study & Laptops
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  // Books & Reading
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
  // Writing & Notes
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
  // Science & Math
  'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
  // Classroom & Campus
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  // Creative & Art
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
];

export function getCoverImage(courseId: string, coverImageUrl?: string | null): string {
  if (coverImageUrl) return coverImageUrl;
  // Stronger hash: multiply by position to spread sequential IDs
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash + courseId.charCodeAt(i) * (i + 7)) % COVER_PALETTE.length;
  }
  return COVER_PALETTE[hash];
}
