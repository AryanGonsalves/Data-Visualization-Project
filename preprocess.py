import pandas as pd
import numpy as np 
data = pd.read_csv("data/Economy/inflation.csv")



# Calculate the mean of all columns from Jan to Dec for each year
monthly_columns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
data['Yearly_Mean'] = data[monthly_columns].mean(axis=1)
print (data)