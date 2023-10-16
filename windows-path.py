import win32gui
import os

# Callback function to retrieve window paths
def enum_windows_callback(hwnd, results):
    if win32gui.GetClassName(hwnd) == 'CabinetWClass':
        window_title = win32gui.GetWindowText(hwnd)
        if window_title:
            path = window_title.split(' - ')[-1]
            if path not in results:
                results.append(path)

# Get all open Windows Explorer windows
explorer_windows = []
win32gui.EnumWindows(enum_windows_callback, explorer_windows)

# Save the window paths to a text file
with open('explorer_paths.txt', 'w') as f:
    for path in explorer_windows:
        f.write(path + '\n')