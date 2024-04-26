# Wireless Channel Measurements Planner

This tool provides functionality to plan air-to-ground measurements, based on the air-to-ground measurement system described in:

[AERIAL Project: Measurement system](https://jvvtt.github.io/a2gMeasurements/MeasurementSystem/)

The measurement methodology used by the system is also described there in:

[AERIAL Project: Measurement methodology](https://jvvtt.github.io/a2gMeasurements/PlanningMeasurements/)

Functionality:

* Map interface where user can place drone and ground locations, measure distance, place Flight Geography polygons enclosing drone locations, and Point of Interest (POI) markers to set the reference of the gimbal used for the ground location.
* Controls to change the height of the drone (influencing battery consumption and Ground Risk Buffer definition according to PDRA-S01), the hovering time of the drone (influencing the time allowed to make measurements) and the drone speed, among others.
* A scheduler which specifies the precise timing and actions each actor (Drone Operator, Software Operator, Driver Operator) must take on a measurement campaing.

UPDATES:

Up to now the tool works with the Case 1 methodology shown in [Case 1 Methodology](https://jvvtt.github.io/a2gMeasurements/MeasMethodology/#case-1), with the ground node static.
