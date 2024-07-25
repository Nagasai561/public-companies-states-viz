
# companies_states_file_path = "./processed_data/companies_states.csv"
# temp_file_path = "./processed_data/temp.txt"

# with open(companies_states_file_path, 'r') as companies_states_file:
#     with open(temp_file_path, 'w') as temp_file:
#         for line in companies_states_file:
#             temp_file.write(line)


# with open(companies_states_file_path, 'w') as companies_states_file:
#     with open(temp_file_path, 'r') as temp_file:
#         for line in temp_file:
#             modified_line = line.replace("&", "and")
#             modified_line = modified_line.replace("Delhi", "NCT of Delhi")
#             modified_line = modified_line.replace("Orissa", "Odisha")
#             companies_states_file.write(modified_line)

import json 
import re

map_path = "./fetched_data/gadm41_IND_1.json"
and_pat = re.compile("and(?=[A-Z])")
captial_pat = re.compile("(?<=[a-z])(?=[A-Z])")
of_pat = re.compile("of")

with open(map_path, 'r') as map_file:
    dict = json.load(map_file)
    to_remove = []
    for x in dict["features"]:
        string = x["properties"]["NAME_1"]
        string = re.sub(and_pat, " and", string)
        string = re.sub(captial_pat, " ", string)
        string = re.sub(of_pat, " of", string)
        x["properties"]["NAME_1"] = string
        if(x["properties"]["GID_0"] != "IND" and x["properties"]["GID_0"] != "Z01"):
            to_remove.append(x)

for x in to_remove:
    dict["features"].remove(x)

with open("./processed_data/final_map.json", 'w') as file:
    json.dump(dict, file)

