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

