
import sys

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import re
import os
import json
# URL of the page to scrape
# url = "https://leetcode.com/problems/palindrome-number/description/"
# url = "https://leetcode.com/problems/zigzag-conversion/"


chrome_options = Options()
chrome_options.add_argument("--headless")
# chrome_options.add_argument("--disable-gpu")
# chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-blink-features=AutomationControlled") 
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36") 



service = Service()  
driver = webdriver.Chrome(service=service, options=chrome_options)








def convert_to_dict(input_list):
    """
    Converts a structured list of inputs and outputs into a dictionary format.
    Handles multiple inputs, varied output types, and explanations.

    Args:
    input_list (list): A list containing input-output pairs with explanations.

    Returns:
    list: A list of dictionaries representing the input-output structure.
    """


    new_l = []

    for item in input_list:
        if(item[0][0:5]=='Input'):
            new_l.append(item)
    result = []

    for item in new_l:
        entry = {"input": {}, "output": None}
        i = 0

        while i < len(item) and item[i].startswith("Input:"):
          
            input_str = item[i].replace("Input:", "").strip()
            inputs = input_str.split(", ")
            for inp in inputs:
                key, value = inp.split("=")
                key = key.strip()
                value = value.strip().strip('"')  
                try:
                    
                    value = int(value)
                except ValueError:
                    pass  
                entry["input"][key] = value
            i += 1


        if i < len(item) and item[i].startswith("Output:"):
            output_str = item[i].replace("Output:", "").strip()
            try:
                
                entry["output"] = eval(output_str)
            except:
                entry["output"] = output_str 
            i += 1


        result.append(entry)

    return result



def create_input_output_files(data , base_dir):
    """
    Creates 'inputs' and 'outputs' directories in the current working directory,
    and writes input and output data into numbered .txt files.

    Args:
    data (list): A list of dictionaries with "input" and "output" keys.
    """

    input_dir = os.path.join(base_dir, 'inputs')
    output_dir = os.path.join(base_dir, 'outputs')


    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)


    for i, entry in enumerate(data, start=1):
  
        input_file_path = os.path.join(input_dir, f'input_{i}.txt')
        with open(input_file_path, 'w') as input_file:
            input_file.write(json.dumps(entry['input'], indent=4))

 
        output_file_path = os.path.join(output_dir, f'output_{i}.txt')
        with open(output_file_path, 'w') as output_file:
            output_file.write(json.dumps(entry['output'], indent=4) if isinstance(entry['output'], (dict, list))
                              else str(entry['output']))

    print(f"Files created in '{input_dir}' and '{output_dir}'.")








def fetchTestCasesFromURL(url , base_dir):
    try:
        
        driver.get(url)
   

        wait = WebDriverWait(driver, 15) 
        element = wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "elfjS"))
        )


        page_source = driver.page_source


        soup = BeautifulSoup(page_source, "html.parser")


        description = soup.find("div", class_="elfjS")
        
        if description:
            examples = description.find_all("pre", class_=False)
            temp_l = []
            for example in examples:
                result_list = example.text.split('\n')
                temp_l.append(result_list)
            temp_d = convert_to_dict(temp_l)
            create_input_output_files(temp_d , base_dir)
        else:
            print("Description not found.")


    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        driver.quit()




     



if __name__ == '__main__':
    url = sys.argv[1]  
    hard_coded_dir = sys.argv[2]  

    # url = "https://leetcode.com/problems/palindrome-number/description/"
    # hard_coded_dir = "d:\\Ojasv\\coding\\Tinkering open project\\test environment 2"
    fetchTestCasesFromURL(url, hard_coded_dir)
    sys.stdout.flush()

