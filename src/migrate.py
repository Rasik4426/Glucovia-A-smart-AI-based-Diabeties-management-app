import os
import re

REPLACEMENTS = {
    r"import\s*\{\s*base44\s*\}\s*from\s*['\"]@/api/base44Client['\"]\s*;?": "",
    r"base44\.auth\.me\(\)": "me()",
    r"base44\.auth\.updateMe\(([^)]+)\)": r"updateMe(\1)",
    r"base44\.auth\.isAuthenticated\(\)": "isAuthenticated()",
    r"base44\.auth\.logout\(\)": "logout()",
    r"base44\.auth\.redirectToLogin\(([^)]+)\)": r"navigateToLogin(\1)",
    r"base44\.entities\.User\.list\(\)": "listUsers()",
    r"base44\.entities\.User\.filter\(([^)]+)\)": r"filterUsers(\1)",
    r"base44\.entities\.User\.create\(([^)]+)\)": r"createUser(\1)",
    r"base44\.entities\.GlucoseLog\.create\(([^)]+)\)": r"createGlucoseLog(\1)",
    r"base44\.entities\.GlucoseLog\.filter\(([^)]+)\)": r"filterGlucoseLogs(\1)",
    r"base44\.entities\.InsulinLog\.create\(([^)]+)\)": r"createInsulinLog(\1)",
    r"base44\.entities\.InsulinLog\.filter\(([^)]+)\)": r"filterInsulinLogs(\1)",
    r"base44\.entities\.MealLog\.create\(([^)]+)\)": r"createMealLog(\1)",
    r"base44\.entities\.MealLog\.filter\(([^)]+)\)": r"filterMealLogs(\1)",
    r"base44\.entities\.ParentReminder\.create\(([^)]+)\)": r"createReminder(\1)",
    r"base44\.entities\.ParentReminder\.filter\(([^)]+)\)": r"filterParentReminders(\1)",
    r"base44\.entities\.ParentReminder\.update\(([^)]+)\)": r"updateParentReminder(\1)",
    r"base44\.entities\.ChatMessage\.create\(([^)]+)\)": r"sendMessage(\1)",
    r"base44\.entities\.ChatMessage\.filter\(([^)]+)\)": r"filterChatMessages(\1)",
    r"base44\.entities\.MedicalDocument\.create\(([^)]+)\)": r"createDocument(\1)",
    r"base44\.entities\.MedicalDocument\.filter\(([^)]+)\)": r"filterMedicalDocuments(\1)",
    r"base44\.entities\.MedicalDocument\.delete\(([^)]+)\)": r"deleteDocument(\1)",
    r"base44\.entities\.Reward\.create\(([^)]+)\)": r"createReward(\1)",
    r"base44\.entities\.Reminder\.filter\(([^)]+)\)": r"filterReminders(\1)",
    r"base44\.entities\.Reminder\.create\(([^)]+)\)": r"createSelfReminder(\1)",
    r"base44\.entities\.Reminder\.update\(([^)]+)\)": r"updateSelfReminder(\1)",
    r"base44\.entities\.Reminder\.delete\(([^)]+)\)": r"deleteSelfReminder(\1)",
    r"base44\.integrations\.Core\.UploadFile\(([^)]+)\)": r"uploadFile(\1)",
}

API_IMPORTS = """import {
  me, updateMe, isAuthenticated, logout, navigateToLogin,
  listUsers, filterUsers, createUser,
  createGlucoseLog, filterGlucoseLogs,
  createInsulinLog, filterInsulinLogs,
  createMealLog, filterMealLogs,
  createReminder, filterParentReminders, updateParentReminder,
  sendMessage, filterChatMessages,
  filterMedicalDocuments, deleteDocument, uploadFile,
  createReward,
  filterReminders, createSelfReminder, updateSelfReminder, deleteSelfReminder
} from '@/api/api';
"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files without base44 references
    if 'base44' not in content:
        return False

    original = content

    # Remove base44 import
    content = re.sub(r"import\s*\{\s*base44\s*\}\s*from\s*['\"]@/api/base44Client['\"]\s*;?\n?", "", content)

    # Apply all replacements
    for pattern, replacement in REPLACEMENTS.items():
        content = re.sub(pattern, replacement, content)

    # Remove any remaining @ts-ignore comments related to base44
    content = re.sub(r"\s*// @ts-ignore\s*\n\s*base44\.", "\n", content)
    content = re.sub(r"\s*// @ts-ignore\s*\n\s*(me|updateMe|isAuthenticated|logout|navigateToLogin|listUsers|filterUsers|createUser|createGlucoseLog|filterGlucoseLogs|createInsulinLog|filterInsulinLogs|createMealLog|filterMealLogs|createReminder|filterParentReminders|updateParentReminder|sendMessage|filterChatMessages|filterMedicalDocuments|deleteDocument|uploadFile|createReward|filterReminders|createSelfReminder|updateSelfReminder|deleteSelfReminder)\(", "\n\\1(", content)

    # Add api import if we made replacements and file doesn't have it
    if content != original and 'from \'@/api/api\'' not in content:
        # Find a good place to insert import
        import_idx = content.find("import ")
        if import_idx >= 0:
            # Find end of import block
            lines = content.split('\n')
            last_import_line = 0
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import_line = i
            lines.insert(last_import_line + 1, API_IMPORTS.strip())
            content = '\n'.join(lines)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

files_to_process = [
    'lib/PageNotFound.jsx',
    'pages/RoleSetup.jsx',
    'pages/ChildDashboard.jsx',
    'pages/DoctorChat.jsx',
    'pages/DoctorDashboard.jsx',
    'pages/Gamification.jsx',
    'pages/LogEntry.jsx',
    'pages/MedicalDocuments.jsx',
    'pages/ParentDashboard.jsx',
    'pages/Reminders.jsx',
    'pages/Reports.jsx',
    'components/GlucoseAlertSystem.jsx',
    'lib/syncManager.js',
]

base_dir = 'd:/OneDrive/Documents/PBL/pbl project/my-app/src'
for rel_path in files_to_process:
    full_path = os.path.join(base_dir, rel_path)
    if os.path.exists(full_path):
        changed = process_file(full_path)
        print(f"{'[CHANGED]' if changed else '[skipped]'} {rel_path}")
    else:
        print(f"[MISSING] {rel_path}")

print("\nDone!")
