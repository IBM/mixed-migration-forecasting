# mixed-migration-forecasting

The Foresight system (previously Mixed Migration Forecasting) is a forecasting system for the Danish Refugee Council (DRC) aimed at providing long term forecasts on forced displacement volumes and causal analysis of drivers of displacement. 

This repository contains code assets related to data aggregation, machine learning and bayesian network learning, and user interface components. It is organized in two separate applications. 

* `server`  - Contains data aggregation, model generation, APIs. See [README.md](server/README.md) 
[![Build Status](https://travis-ci.org/IBM/mixed-migration-forecasting.svg?branch=master)](https://travis-ci.org/IBM/mixed-migration-forecasting)
* `ui` - responsible for data visualisation, user-managment, report handling unit of a system. See [README](ui/README.md)


## References

Some details are describe in this [blog post](https://www.ibm.com/blogs/research/2019/01/machine-learning-humanitarian-sector/)
and a [paper](https://ieeexplore.ieee.org/document/8880487) which can be cited as follows:

```
@ARTICLE{8880487,  author={R. {Nair} and B. S. {Madsen} and H. {Lassen} and S. {Baduk} and S. {Nagarajan} and L. H. {Mogensen} and R. {Novack} and R. {Curzon} and J. {Paraszczak} and S. {Urbak}},  
journal={IBM Journal of Research and Development},  
title={A machine learning approach to scenario analysis and forecasting of mixed migration},   
year={2020},  volume={64},  number={1/2},  pages={7:1-7:7}}
```
