# AI Language Support Implementation

## Overview
Updated the AI task generation system to return recommendations in the user's selected language script.

## Changes Made

### 1. **shared/api.ts** - Type Definitions
- Added `language?: string` field to `GenerateTasksRequest` interface
- This allows the client to pass the selected language to the API

### 2. **server/routes/generate-tasks.ts** - API Route
- Extracts `language` from request body
- Passes language to `generateTasksForCity` function
- Defaults to "English" if not provided

### 3. **server/services/ai-service.ts** - AI Service
- Updated `generateTasksForCity` function signature to accept `language` parameter
- Modified `buildPrompt` function to include language in the prompt
- Added two key constraints to the AI prompt:
  1. User's language is specified in the User Profile section
  2. Explicit instruction: "Write ALL text content (place names, descriptions, type labels) in [language] script"
  3. Response format examples now specify text should be in the selected language
  4. Important note emphasizes ALL text fields must be in the selected language script

### 4. **client/context/UserContext.tsx** - Client Integration
- Added language code to language name mapping
- Retrieves selected language from localStorage
- Converts language code (e.g., 'hi') to full name (e.g., 'Hindi')
- Includes language in the API request body

## Language Support
Supports all 12 languages in the application:
- English (en)
- Hindi (hi) - हिन्दी
- Telugu (te) - తెలుగు
- Kannada (kn) - ಕನ್ನಡ
- Marathi (mr) - मराठी
- Punjabi (pa) - ਪੰਜਾਬੀ
- Gujarati (gu) - ગુજરાતી
- Odia (or) - ଓଡ଼ିଆ
- Bengali (bn) - বাংলা
- Malayalam (ml) - മലയാളം
- Tamil (ta) - தமிழ்
- Urdu (ur) - اردو

## How It Works

1. **User selects language** during onboarding or in language selection
2. **Language is stored** in localStorage as `selectedLanguage`
3. **When generating tasks**, the client:
   - Reads the language code from localStorage
   - Converts it to full language name (e.g., 'bn' → 'Bengali')
   - Sends it to the API along with city, country, and preferences
4. **The AI prompt** explicitly instructs Gemini to:
   - Return all place names in the selected language script
   - Write descriptions in the selected language
   - Use native script for type labels and duration text
5. **Gemini returns** recommendations with all text in the selected language
6. **Tasks are displayed** to the user in their preferred language

## Example Prompt Enhancement

**Before:**
```
Generate 8-12 personalized travel recommendations for Paris, France.
```

**After (for Hindi user):**
```
Generate 8-12 personalized travel recommendations for Paris, France.

User Profile:
- Language: Hindi

Task Requirements:
...
7. IMPORTANT: Write ALL text content (place names, descriptions, type labels) in Hindi script

Response Format - Return ONLY valid JSON, no other text:
{
  "tasks": [
    {
      "name": "Place Name in Hindi",
      "type": "Type in Hindi",
      "description": "Description in Hindi",
      "estimated_duration": "Duration text in Hindi"
    }
  ]
}

IMPORTANT: 
- ALL text fields must be in Hindi script
```

## Benefits

1. **Consistent Experience**: Users see content in their selected language throughout the app
2. **Better Comprehension**: Travel recommendations are easier to understand in native language
3. **Accessibility**: Makes the app more accessible to non-English speakers
4. **Cultural Context**: Place names and descriptions in local script provide better cultural context

## Testing

To test this feature:
1. Select a non-English language (e.g., Hindi, Telugu, Bengali)
2. Complete onboarding and add a chapter
3. Generate AI tasks for a city
4. Verify that place names, types, descriptions, and durations are in the selected language script

## Notes

- If language is not provided, defaults to English
- The AI (Gemini) is instructed multiple times to ensure compliance
- All 12 supported languages will receive native script recommendations
- The JSON structure remains unchanged, only the text content is localized
