const templates = [
    {
      "id": "layout_3_horizontal",
      "name": "3 Horizontal",
      "imageCount": 3,
      "slots": [
        { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.33, "height": 1.0 },
        { "id": "slot2", "x": 0.33, "y": 0.0, "width": 0.34, "height": 1.0 },
        { "id": "slot3", "x": 0.67, "y": 0.0, "width": 0.33, "height": 1.0 }
      ]
    },
    {
      "id": "layout_3_vertical",
      "name": "3 Vertical",
      "imageCount": 3,
      "slots": [
        { "id": "slot1", "x": 0.0, "y": 0.0, "width": 1.0, "height": 0.33 },
        { "id": "slot2", "x": 0.0, "y": 0.33, "width": 1.0, "height": 0.34 },
        { "id": "slot3", "x": 0.0, "y": 0.67, "width": 1.0, "height": 0.33 }
      ]
    },
    {
      "id": "layout_4_grid_2x2",
      "name": "4 Grid 2x2",
      "imageCount": 4,
      "slots": [
        { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.5, "height": 0.5 },
        { "id": "slot2", "x": 0.5, "y": 0.0, "width": 0.5, "height": 0.5 },
        { "id": "slot3", "x": 0.0, "y": 0.5, "width": 0.5, "height": 0.5 },
        { "id": "slot4", "x": 0.5, "y": 0.5, "width": 0.5, "height": 0.5 }
      ]
    },
    {
      "id": "layout_4_horizontal_vertical_mix",
      "name": "4 Mixed Horizontal and Vertical",
      "imageCount": 4,
      "slots": [
        { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.5, "height": 0.5 },
        { "id": "slot2", "x": 0.5, "y": 0.0, "width": 0.5, "height": 0.5 },
        { "id": "slot3", "x": 0.0, "y": 0.5, "width": 1.0, "height": 0.25 },
        { "id": "slot4", "x": 0.0, "y": 0.75, "width": 1.0, "height": 0.25 }
      ]
    },
    {
      "id": "layout_5_column_focus",
      "name": "5 with Large Center",
      "imageCount": 5,
      "slots": [
        { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.33, "height": 0.5 },
        { "id": "slot2", "x": 0.33, "y": 0.0, "width": 0.34, "height": 0.5 },
        { "id": "slot3", "x": 0.67, "y": 0.0, "width": 0.33, "height": 0.5 },
        { "id": "slot4", "x": 0.0, "y": 0.5, "width": 0.5, "height": 0.5 },
        { "id": "slot5", "x": 0.5, "y": 0.5, "width": 0.5, "height": 0.5 }
      ]
    },
    {
      "id": "layout_5_cross",
      "name": "5 Cross Style",
      "imageCount": 5,
      "slots": [
        { "id": "slot1", "x": 0.33, "y": 0.0, "width": 0.34, "height": 0.33 },
        { "id": "slot2", "x": 0.0, "y": 0.33, "width": 0.33, "height": 0.34 },
        { "id": "slot3", "x": 0.33, "y": 0.33, "width": 0.34, "height": 0.34 },
        { "id": "slot4", "x": 0.67, "y": 0.33, "width": 0.33, "height": 0.34 },
        { "id": "slot5", "x": 0.33, "y": 0.67, "width": 0.34, "height": 0.33 }
      ]
    },
    {
        "id": "layout_6_grid_3x2",
        "name": "6 Grid 3x2",
        "imageCount": 6,
        "slots": [
          { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.33, "height": 0.5 },
          { "id": "slot2", "x": 0.33, "y": 0.0, "width": 0.34, "height": 0.5 },
          { "id": "slot3", "x": 0.67, "y": 0.0, "width": 0.33, "height": 0.5 },
          { "id": "slot4", "x": 0.0, "y": 0.5, "width": 0.33, "height": 0.5 },
          { "id": "slot5", "x": 0.33, "y": 0.5, "width": 0.34, "height": 0.5 },
          { "id": "slot6", "x": 0.67, "y": 0.5, "width": 0.33, "height": 0.5 }
        ]
      },
      {
        "id": "layout_7_l_shape",
        "name": "7 L-Shape",
        "imageCount": 7,
        "slots": [
          { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.33, "height": 0.33 },
          { "id": "slot2", "x": 0.33, "y": 0.0, "width": 0.33, "height": 0.33 },
          { "id": "slot3", "x": 0.66, "y": 0.0, "width": 0.34, "height": 0.33 },
          { "id": "slot4", "x": 0.0, "y": 0.33, "width": 0.33, "height": 0.33 },
          { "id": "slot5", "x": 0.0, "y": 0.66, "width": 0.33, "height": 0.34 },
          { "id": "slot6", "x": 0.33, "y": 0.66, "width": 0.33, "height": 0.34 },
          { "id": "slot7", "x": 0.66, "y": 0.66, "width": 0.34, "height": 0.34 }
        ]
      },
      {
        "id": "layout_8_grid_4x2",
        "name": "8 Grid 4x2",
        "imageCount": 8,
        "slots": [
          { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.25, "height": 0.5 },
          { "id": "slot2", "x": 0.25, "y": 0.0, "width": 0.25, "height": 0.5 },
          { "id": "slot3", "x": 0.5, "y": 0.0, "width": 0.25, "height": 0.5 },
          { "id": "slot4", "x": 0.75, "y": 0.0, "width": 0.25, "height": 0.5 },
          { "id": "slot5", "x": 0.0, "y": 0.5, "width": 0.25, "height": 0.5 },
          { "id": "slot6", "x": 0.25, "y": 0.5, "width": 0.25, "height": 0.5 },
          { "id": "slot7", "x": 0.5, "y": 0.5, "width": 0.25, "height": 0.5 },
          { "id": "slot8", "x": 0.75, "y": 0.5, "width": 0.25, "height": 0.5 }
        ]
      },
      {
        "id": "layout_9_grid_3x3",
        "name": "9 Grid 3x3",
        "imageCount": 9,
        "slots": [
          { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.33, "height": 0.33 },
          { "id": "slot2", "x": 0.33, "y": 0.0, "width": 0.34, "height": 0.33 },
          { "id": "slot3", "x": 0.67, "y": 0.0, "width": 0.33, "height": 0.33 },
          { "id": "slot4", "x": 0.0, "y": 0.33, "width": 0.33, "height": 0.34 },
          { "id": "slot5", "x": 0.33, "y": 0.33, "width": 0.34, "height": 0.34 },
          { "id": "slot6", "x": 0.67, "y": 0.33, "width": 0.33, "height": 0.34 },
          { "id": "slot7", "x": 0.0, "y": 0.67, "width": 0.33, "height": 0.33 },
          { "id": "slot8", "x": 0.33, "y": 0.67, "width": 0.34, "height": 0.33 },
          { "id": "slot9", "x": 0.67, "y": 0.67, "width": 0.33, "height": 0.33 }
        ]
      },
      {
        "id": "layout_10_mixed_rows",
        "name": "10 Mixed Rows",
        "imageCount": 10,
        "slots": [
          { "id": "slot1", "x": 0.0, "y": 0.0, "width": 0.2, "height": 0.25 },
          { "id": "slot2", "x": 0.2, "y": 0.0, "width": 0.2, "height": 0.25 },
          { "id": "slot3", "x": 0.4, "y": 0.0, "width": 0.2, "height": 0.25 },
          { "id": "slot4", "x": 0.6, "y": 0.0, "width": 0.2, "height": 0.25 },
          { "id": "slot5", "x": 0.8, "y": 0.0, "width": 0.2, "height": 0.25 },
          { "id": "slot6", "x": 0.0, "y": 0.25, "width": 0.33, "height": 0.75 },
          { "id": "slot7", "x": 0.33, "y": 0.25, "width": 0.34, "height": 0.75 },
          { "id": "slot8", "x": 0.67, "y": 0.25, "width": 0.33, "height": 0.25 },
          { "id": "slot9", "x": 0.67, "y": 0.5, "width": 0.33, "height": 0.25 },
          { "id": "slot10", "x": 0.67, "y": 0.75, "width": 0.33, "height": 0.25 }
        ]
      }
      
];

export default templates;
  