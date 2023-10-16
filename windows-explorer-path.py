import win32gui
import os

# Callback function to retrieve folder paths
def enum_windows_callback(hwnd, results):
    if win32gui.GetClassName(hwnd) == 'CabinetWClass':
        folder_path = win32gui.GetWindowText(hwnd)
        if folder_path:
            path = folder_path.split(' - ')[-1]
            if os.path.isdir(path) and path not in results:
                results.append(path)

# Get all open Windows Explorer windows
explorer_windows = []
win32gui.EnumWindows(enum_windows_callback, explorer_windows)

# Save the folder paths to a text file
with open('folder_paths.txt', 'w') as f:
    for path in explorer_windows:
        f.write(path + '\n')