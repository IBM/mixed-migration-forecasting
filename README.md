# mm4sight
Asset with the Danish Refugee Council for the mixed migration and displacement forecasting project.

### Setting up

To get started, clone this repository.

```
$ git clone git@github.com:IBM/mixed-migration-forecasting.git
```

Then setup a python environment. If you use the Anaconda distribution (recommended), create a python virtual environment using `conda`. This way your project specific dependencies are isolated.

```
$ conda create -n mm4sight python=3.7.4
$ source activate mm4sight
(mm4sight) $ pip install -r requirements.txt
```

Here `source activate mm4isght` activates the virtual environment (`source deactivate` will deactivate it). `pip install` directives will install packages for the virtual environment.

Fetch the data artifacts. TBD


### Running

The code is in three parts. 

*Data Transformation* (optional): Scripts related to data manipulation. Data transformations are run based on the `configuration.json` file that has a source file along with a transformer class for each source. All transformer implementations are within the [transformer](https://github.com/IBM/mixed-migration-forecasting/tree/master/transformer) folder. The entire transformation script can be run by activating your python virtual environment and running the wrapper script so. 

```
$ source activate mm4sight
(mm4sight) $ python executor.py
```
This standardizes the data and populates the [processed](https://github.com/IBM/mixed-migration-forecasting/tree/master/prm-datasets/processed) folder. A base set of processed data is available. So this step is only needed when new data sources or features are added.

*Models*: The models specification is available as a module in this repository. To recreate the model objects, run
```
(mm4sight) $ python model/trainer.py
```

*Deployment*: We use a cloud foundry build pack which can be deployed to IBM Cloud.