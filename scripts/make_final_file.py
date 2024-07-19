import csv

final_file_path = "./processed_data/final_file.csv"
companies_states_file_path = "./processed_data/companies_states.csv"
aggregated_companies_file_path = "processed_data/aggregated_companies.csv"

with open(final_file_path, 'w') as final_file:
    final_writer = csv.DictWriter(final_file, fieldnames=["Security Id", "Security Name", "Sector Name", "Market Cap", "State"])
    with open(companies_states_file_path, 'r') as companies_states_file:
        with open(aggregated_companies_file_path, 'r') as aggregated_companies_file:

            companies_states_reader = csv.DictReader(companies_states_file)
            aggregated_companies_reader = csv.DictReader(aggregated_companies_file)
            final_writer.writeheader()

            for csr_line, acr_line in zip(companies_states_reader, aggregated_companies_reader):
                final_writer.writerow({
                    "Security Id": acr_line["Security Id"],
                    "Security Name": acr_line["Security Name"],
                    "Sector Name": acr_line["Sector Name"],
                    "Market Cap": csr_line["Market Cap"],
                    "State": csr_line["State"]
                })
