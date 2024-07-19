
companies_states_file_path = "./processed_data/companies_states.csv"
temp_file_path = "./processed_data/temp.txt"

with open(companies_states_file_path, 'r') as companies_states_file:
    with open(temp_file_path, 'w') as temp_file:
        for line in companies_states_file:
            temp_file.write(line)


with open(companies_states_file_path, 'w') as companies_states_file:
    with open(temp_file_path, 'r') as temp_file:
        for line in temp_file:
            modified_line = line.replace("&", "and")
            modified_line = modified_line.replace("Delhi", "NCT of Delhi")
            modified_line = modified_line.replace("Orissa", "Odisha")
            companies_states_file.write(modified_line)