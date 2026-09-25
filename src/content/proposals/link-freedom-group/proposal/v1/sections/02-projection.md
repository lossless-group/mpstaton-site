---
chapter: "01"
id: projection
layout: prose
eyebrow: "The prize, sized"
title: "What channels are worth over the life of the TLDs"
card_summary: "Two ten-year revenue bands across 40 TLDs. Same prices, same portfolio — the only variable is distribution."
subhead: "A registry holds the right to administer a TLD for ten years. That is the window this decision plays out over, and the gap between the two bands below is the entire argument for building a channel at all."
---
Two views of the same model. The first shows what the TLDs earn **each
year**; the second is the **running total**, which is the number that matters
when the right to administer a TLD lasts ten years.

Every bar spans the price range rather than asserting a price: the **▼ marker
is $20 a year per domain, the ▲ marker is $100.** Hover any bar for its exact figures; click a legend swatch to isolate one
scenario, and click it again to bring both back.

```vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "title": {
    "text": "Annual revenue across 40 TLDs",
    "subtitle": "Each bar spans the price range: \u25bc $20/yr per domain, \u25b2 $100/yr"
  },
  "width": "container",
  "height": 300,
  "data": {
    "values": [
      {
        "year": 1,
        "scenario": "Without VAR partners",
        "low": 0.8,
        "high": 4.0,
        "spread": 3.2
      },
      {
        "year": 1,
        "scenario": "With VAR partners",
        "low": 4.8,
        "high": 24.0,
        "spread": 19.2
      },
      {
        "year": 2,
        "scenario": "Without VAR partners",
        "low": 2.0,
        "high": 10.0,
        "spread": 8.0
      },
      {
        "year": 2,
        "scenario": "With VAR partners",
        "low": 10.4,
        "high": 52.0,
        "spread": 41.6
      },
      {
        "year": 3,
        "scenario": "Without VAR partners",
        "low": 3.2,
        "high": 16.0,
        "spread": 12.8
      },
      {
        "year": 3,
        "scenario": "With VAR partners",
        "low": 14.0,
        "high": 70.0,
        "spread": 56.0
      },
      {
        "year": 4,
        "scenario": "Without VAR partners",
        "low": 4.4,
        "high": 22.0,
        "spread": 17.6
      },
      {
        "year": 4,
        "scenario": "With VAR partners",
        "low": 16.4,
        "high": 82.0,
        "spread": 65.6
      },
      {
        "year": 5,
        "scenario": "Without VAR partners",
        "low": 5.6,
        "high": 28.0,
        "spread": 22.4
      },
      {
        "year": 5,
        "scenario": "With VAR partners",
        "low": 18.0,
        "high": 90.0,
        "spread": 72.0
      },
      {
        "year": 6,
        "scenario": "Without VAR partners",
        "low": 6.8,
        "high": 34.0,
        "spread": 27.2
      },
      {
        "year": 6,
        "scenario": "With VAR partners",
        "low": 19.2,
        "high": 96.0,
        "spread": 76.8
      },
      {
        "year": 7,
        "scenario": "Without VAR partners",
        "low": 7.6,
        "high": 38.0,
        "spread": 30.4
      },
      {
        "year": 7,
        "scenario": "With VAR partners",
        "low": 20.0,
        "high": 100.0,
        "spread": 80.0
      },
      {
        "year": 8,
        "scenario": "Without VAR partners",
        "low": 8.4,
        "high": 42.0,
        "spread": 33.6
      },
      {
        "year": 8,
        "scenario": "With VAR partners",
        "low": 20.8,
        "high": 104.0,
        "spread": 83.2
      },
      {
        "year": 9,
        "scenario": "Without VAR partners",
        "low": 9.0,
        "high": 44.8,
        "spread": 35.8
      },
      {
        "year": 9,
        "scenario": "With VAR partners",
        "low": 21.4,
        "high": 107.2,
        "spread": 85.8
      },
      {
        "year": 10,
        "scenario": "Without VAR partners",
        "low": 9.6,
        "high": 48.0,
        "spread": 38.4
      },
      {
        "year": 10,
        "scenario": "With VAR partners",
        "low": 22.0,
        "high": 110.0,
        "spread": 88.0
      }
    ]
  },
  "encoding": {
    "x": {
      "field": "year",
      "type": "ordinal",
      "title": "Year",
      "axis": {
        "labelAngle": 0
      }
    },
    "xOffset": {
      "field": "scenario",
      "type": "nominal",
      "scale": {
        "domain": [
          "Without VAR partners",
          "With VAR partners"
        ]
      }
    },
    "color": {
      "field": "scenario",
      "type": "nominal",
      "title": null,
      "scale": {
        "domain": [
          "With VAR partners",
          "Without VAR partners"
        ],
        "range": [
          "#04E5E5",
          "#7C8592"
        ]
      },
      "legend": {
        "orient": "top",
        "symbolType": "stroke",
        "symbolStrokeWidth": 6
      }
    },
    "tooltip": [
      {
        "field": "scenario",
        "type": "nominal",
        "title": "Scenario"
      },
      {
        "field": "year",
        "type": "ordinal",
        "title": "Year"
      },
      {
        "field": "low",
        "type": "quantitative",
        "title": "At $20/yr",
        "format": "$,.1f"
      },
      {
        "field": "high",
        "type": "quantitative",
        "title": "At $100/yr",
        "format": "$,.1f"
      },
      {
        "field": "spread",
        "type": "quantitative",
        "title": "Range",
        "format": "$,.1f"
      }
    ]
  },
  "layer": [
    {
      "mark": {
        "type": "rule",
        "strokeWidth": 7,
        "strokeCap": "butt"
      },
      "encoding": {
        "y": {
          "field": "low",
          "type": "quantitative",
          "title": "Annual revenue ($M)",
          "axis": {
            "format": "$,.0f"
          }
        },
        "y2": {
          "field": "high"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.6
          },
          "value": 0.12
        }
      },
      "params": [
        {
          "name": "scenarioSelect",
          "select": {
            "type": "point",
            "fields": [
              "scenario"
            ]
          },
          "bind": "legend"
        }
      ]
    },
    {
      "mark": {
        "type": "point",
        "shape": "triangle-up",
        "size": 70,
        "filled": true
      },
      "encoding": {
        "y": {
          "field": "high",
          "type": "quantitative"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.95
          },
          "value": 0.12
        }
      }
    },
    {
      "mark": {
        "type": "point",
        "shape": "triangle-down",
        "size": 70,
        "filled": true
      },
      "encoding": {
        "y": {
          "field": "low",
          "type": "quantitative"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.95
          },
          "value": 0.12
        }
      }
    },
    {
      "mark": {
        "type": "line",
        "strokeWidth": 1.5,
        "point": false
      },
      "encoding": {
        "y": {
          "field": "high",
          "type": "quantitative"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.95
          },
          "value": 0.12
        }
      }
    }
  ]
}
```

The shape is the argument. Channel partners put the namespace in front of
people at the moment they are naming something, from launch — so year one
opens at roughly **six times** the volume the conventional path reaches, and
the two lines never converge again.

```vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "title": {
    "text": "Cumulative revenue, ten-year TLD term",
    "subtitle": "Running total. Year 10 equals the figures in the table below."
  },
  "width": "container",
  "height": 300,
  "data": {
    "values": [
      {
        "year": 1,
        "scenario": "Without VAR partners",
        "low": 0.8,
        "high": 4.0,
        "spread": 3.2
      },
      {
        "year": 1,
        "scenario": "With VAR partners",
        "low": 4.8,
        "high": 24.0,
        "spread": 19.2
      },
      {
        "year": 2,
        "scenario": "Without VAR partners",
        "low": 2.8,
        "high": 14.0,
        "spread": 11.2
      },
      {
        "year": 2,
        "scenario": "With VAR partners",
        "low": 15.2,
        "high": 76.0,
        "spread": 60.8
      },
      {
        "year": 3,
        "scenario": "Without VAR partners",
        "low": 6.0,
        "high": 30.0,
        "spread": 24.0
      },
      {
        "year": 3,
        "scenario": "With VAR partners",
        "low": 29.2,
        "high": 146.0,
        "spread": 116.8
      },
      {
        "year": 4,
        "scenario": "Without VAR partners",
        "low": 10.4,
        "high": 52.0,
        "spread": 41.6
      },
      {
        "year": 4,
        "scenario": "With VAR partners",
        "low": 45.6,
        "high": 228.0,
        "spread": 182.4
      },
      {
        "year": 5,
        "scenario": "Without VAR partners",
        "low": 16.0,
        "high": 80.0,
        "spread": 64.0
      },
      {
        "year": 5,
        "scenario": "With VAR partners",
        "low": 63.6,
        "high": 318.0,
        "spread": 254.4
      },
      {
        "year": 6,
        "scenario": "Without VAR partners",
        "low": 22.8,
        "high": 114.0,
        "spread": 91.2
      },
      {
        "year": 6,
        "scenario": "With VAR partners",
        "low": 82.8,
        "high": 414.0,
        "spread": 331.2
      },
      {
        "year": 7,
        "scenario": "Without VAR partners",
        "low": 30.4,
        "high": 152.0,
        "spread": 121.6
      },
      {
        "year": 7,
        "scenario": "With VAR partners",
        "low": 102.8,
        "high": 514.0,
        "spread": 411.2
      },
      {
        "year": 8,
        "scenario": "Without VAR partners",
        "low": 38.8,
        "high": 194.0,
        "spread": 155.2
      },
      {
        "year": 8,
        "scenario": "With VAR partners",
        "low": 123.6,
        "high": 618.0,
        "spread": 494.4
      },
      {
        "year": 9,
        "scenario": "Without VAR partners",
        "low": 47.8,
        "high": 238.8,
        "spread": 191.0
      },
      {
        "year": 9,
        "scenario": "With VAR partners",
        "low": 145.0,
        "high": 725.2,
        "spread": 580.2
      },
      {
        "year": 10,
        "scenario": "Without VAR partners",
        "low": 57.4,
        "high": 286.8,
        "spread": 229.4
      },
      {
        "year": 10,
        "scenario": "With VAR partners",
        "low": 167.0,
        "high": 835.2,
        "spread": 668.2
      }
    ]
  },
  "encoding": {
    "x": {
      "field": "year",
      "type": "ordinal",
      "title": "Year",
      "axis": {
        "labelAngle": 0
      }
    },
    "xOffset": {
      "field": "scenario",
      "type": "nominal",
      "scale": {
        "domain": [
          "Without VAR partners",
          "With VAR partners"
        ]
      }
    },
    "color": {
      "field": "scenario",
      "type": "nominal",
      "title": null,
      "scale": {
        "domain": [
          "With VAR partners",
          "Without VAR partners"
        ],
        "range": [
          "#04E5E5",
          "#7C8592"
        ]
      },
      "legend": {
        "orient": "top",
        "symbolType": "stroke",
        "symbolStrokeWidth": 6
      }
    },
    "tooltip": [
      {
        "field": "scenario",
        "type": "nominal",
        "title": "Scenario"
      },
      {
        "field": "year",
        "type": "ordinal",
        "title": "Year"
      },
      {
        "field": "low",
        "type": "quantitative",
        "title": "At $20/yr",
        "format": "$,.1f"
      },
      {
        "field": "high",
        "type": "quantitative",
        "title": "At $100/yr",
        "format": "$,.1f"
      },
      {
        "field": "spread",
        "type": "quantitative",
        "title": "Range",
        "format": "$,.1f"
      }
    ]
  },
  "layer": [
    {
      "mark": {
        "type": "rule",
        "strokeWidth": 7,
        "strokeCap": "butt"
      },
      "encoding": {
        "y": {
          "field": "low",
          "type": "quantitative",
          "title": "Cumulative revenue ($M)",
          "axis": {
            "format": "$,.0f"
          }
        },
        "y2": {
          "field": "high"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.6
          },
          "value": 0.12
        }
      },
      "params": [
        {
          "name": "scenarioSelect",
          "select": {
            "type": "point",
            "fields": [
              "scenario"
            ]
          },
          "bind": "legend"
        }
      ]
    },
    {
      "mark": {
        "type": "point",
        "shape": "triangle-up",
        "size": 70,
        "filled": true
      },
      "encoding": {
        "y": {
          "field": "high",
          "type": "quantitative"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.95
          },
          "value": 0.12
        }
      }
    },
    {
      "mark": {
        "type": "point",
        "shape": "triangle-down",
        "size": 70,
        "filled": true
      },
      "encoding": {
        "y": {
          "field": "low",
          "type": "quantitative"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.95
          },
          "value": 0.12
        }
      }
    },
    {
      "mark": {
        "type": "line",
        "strokeWidth": 1.5,
        "point": false
      },
      "encoding": {
        "y": {
          "field": "high",
          "type": "quantitative"
        },
        "opacity": {
          "condition": {
            "param": "scenarioSelect",
            "value": 0.95
          },
          "value": 0.12
        }
      }
    }
  ]
}
```

| | Cumulative, 10 years |
| --- | --- |
| Without VAR partners | $57M – $287M |
| With VAR partners | $167M – $835M |
| **Difference** | **$110M – $548M** |

### What the model assumes

- **Without VAR partners** follows a `.app`-shaped curve: a steady
  registrar-led ramp that plateaus. `.app` is the fair comparison — Google's
  own developer TLD, credibly marketed, sold the conventional way, and 750,000
  names after six years.
- **With VAR partners** follows a `.xyz`-shaped front: a hard pop in years one
  and two from being present wherever people build, which then smooths but
  never returns to the lower line. `.xyz` opened with 30,000 registrations on
  day one and passed 750,000 inside six months.

Both scenarios use the same 40 TLDs and the same two prices. **The only
variable is distribution.**

These stay conservative. The upper scenario has the whole 40-TLD portfolio
at about 1.1 million names by year ten — `.xyz` alone passed 6 million. Year
one lands at 240,000 names across all forty, which `.xyz` beat by itself in
under six months. No TLD here is modelled as a breakout.
