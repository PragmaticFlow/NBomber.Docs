
<table>
<tr>
    <td> Load Simulation </td> <td> Type </td> <td> Description </td>
</tr>
<tr>
    <td> RampingConstant </td>
    <td> Closed systems </td>
<td> 

Adds or removes a given number of Scenario copies(instances) with a linear ramp over a given duration. **Each Scenario copy behaves like a long-running thread that runs some logic in a loop.** In other words, every Scenario copy(instance) will continue to iterate(be reused) during the specified duration. Use it for a smooth ramp up and ramp down. Usually, this simulation type is used to test databases, message brokers, or any other system that works with a static client's pool of connections and reuses them.

<p></p>

**Example**: In this example, we combined two simulations: ramp up from 0 to 50 and ramp down from 50 to 20. The NBomber scheduler will be activated periodically to add a new `Scenario` copy instance into the running `Scenarios pool`. This simulation will continue ramping up copies from 0 to 50 until the end duration. After this, the following simulation will start smoothly ramping down Scenario copies from 50 to 20. 

```csharp
scenario.WithLoadSimulations(
    // ramp up from 0 to 50 copies    
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.RampingConstant(copies: 50, during: TimeSpan.FromSeconds(30)),

    // ramp down from 50 to 20 copies
    // duration: 30 seconds (it executes from [00:00:30] to [00:01:00])
    Simulation.RampingConstant(copies: 20, during: TimeSpan.FromSeconds(30))
);
```

</td>
</tr>

</table>