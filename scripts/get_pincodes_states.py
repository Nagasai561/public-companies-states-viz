from selenium import webdriver
import csv

driver = webdriver.Firefox()
url = "https://www.findpincode.net/pincodes-by-states-union-territories"
driver.get(url)
driver.implicitly_wait(5)
table = driver.find_element("xpath", "//table")
with open("./fetched_data/pincodes_states.csv", 'w') as file:
    writer = csv.writer(file)
    writer.writerow(["State", "Minimum Pincode", "Maximum Pincode"])
    first = True
    for element in table.find_elements("xpath", ".//tr"):
        if first:
            first = False
            continue
        data = []
        data.append(element.find_element("xpath", ".//td[1]").text)
        data.append(element.find_element("xpath", ".//td[2]").text)
        data.append(element.find_element("xpath", ".//td[3]").text)
        writer.writerow(data)