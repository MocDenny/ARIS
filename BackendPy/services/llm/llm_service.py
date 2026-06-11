# robot_arduino/services/llm/llm_service.py
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class LLMService(ABC):
    """
    Strategy astratta per un modello linguistico.
    """

    @abstractmethod
    def generate_reply(self, user_text: str) -> Optional[Dict[str, Any]]:
        """
        Deve restituire un dict del tipo:
        {
        {'room_config': {'room_number': '405', 'rooms': {'bedroom': {'name': 'Bedroom', 'lights': [{'name': 'ceiling_light_1', 'state': 'on', 'brightness': 0}, {'name': 'bedside_lamp_1', 'state': 'on', 'brightness': 0}], 'hvac': {'state': 'on', 'target_temp': 20, 'current_temp': 19, 'fan': {'state': 'on', 'speed': 10}}, 'curtains': [{'name': 'window_blind_1', 'state': 'closed'}, {'name': 'window_blind_2', 'state': 'closed'}]}, 'bathroom': {'name': 'Bathroom', 'lights': [{'name': 'ceiling_light_1', 'state': 'on', 'brightness': 0}], 'hvac': {'state': 'on', 'target_temp': 20, 'current_temp': 19, 'fan': {'state': 'on', 'speed': 10}}, 'curtains': [{'name': 'window_blind_1', 'state': 'open'}]}, 'living_room': {'name': 'Living Room', 'lights': [{'name': 'ceiling_light_1', 'state': 'off', 'brightness': 0}, {'name': 'ceiling_light_2', 'state': 'on', 'brightness': 0}], 'hvac': {'state': 'on', 'target_temp': 20, 'current_temp': 19, 'fan': {'state': 'on', 'speed': 10}}, 'curtains': [{'name': 'window_blind_1', 'state': 'closed'}, {'name': 'window_blind_2', 'state': 'closed'}]}}, 'eco_mode': 'off', 'settings': {'learning_mode': 'off'}}}
Traceback (most recent call last):
        }

        Oppure None in caso di errore.
        """
        pass
