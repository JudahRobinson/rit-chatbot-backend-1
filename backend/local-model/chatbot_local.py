#!/usr/bin/env python3
import sys
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model     = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")

def main():
    if len(sys.argv) < 2:
        print("🤖 No input")
        return

    user_input = sys.argv[1]
    input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors="pt")
    chat_history_ids = model.generate(
        input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id
    )

    # only the newly generated tokens
    reply = tokenizer.decode(
        chat_history_ids[:, input_ids.shape[-1]:][0], 
        skip_special_tokens=True
    )
    print(reply)

if __name__ == "__main__":
    main()
