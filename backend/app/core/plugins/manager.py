import importlib
import os
import sys
import logging
from typing import Dict, Any, List, Callable

logger = logging.getLogger("BI-Plateforme")

class PluginManager:
    def __init__(self, plugin_dir: str):
        self.plugin_dir = plugin_dir
        self.plugins: Dict[str, Any] = {}
        self.hooks: Dict[str, List[Callable]] = {}

    def load_plugins(self):
        if not os.path.exists(self.plugin_dir):
            os.makedirs(self.plugin_dir)
            return

        sys.path.append(self.plugin_dir)

        for item in os.listdir(self.plugin_dir):
            if os.path.isdir(os.path.join(self.plugin_dir, item)) or item.endswith(".py"):
                module_name = item.replace(".py", "")
                try:
                    module = importlib.import_module(module_name)
                    if hasattr(module, "setup"):
                        module.setup(self)
                        self.plugins[module_name] = module
                        logger.info(f"Plugin loaded: {module_name}")
                except Exception as e:
                    logger.error(f"Failed to load plugin {module_name}: {str(e)}")

    def register_hook(self, hook_name: str, callback: Callable):
        if hook_name not in self.hooks:
            self.hooks[hook_name] = []
        self.hooks[hook_name].append(callback)
        logger.info(f"Hook registered: {hook_name}")

    def trigger_hook(self, hook_name: str, *args, **kwargs):
        if hook_name in self.hooks:
            for callback in self.hooks[hook_name]:
                try:
                    callback(*args, **kwargs)
                except Exception as e:
                    logger.error(f"Error in hook {hook_name}: {str(e)}")

plugin_manager = PluginManager(os.path.join(os.getcwd(), "plugins"))
