import React, { ReactElement, useState } from 'react';
import { Paper, Typography, IconButton } from '@material-ui/core';
import { useMapEvents } from 'react-leaflet';
import { Layer, Util } from 'leaflet';
import Accordion from '@material-ui/core/Accordion';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LayersIcon from '@material-ui/icons/Layers';
import lodashGroupBy from 'lodash.groupby';
import { LayersControlProvider } from './layerControlContext';

import createControlledLayer from './controlledLayer';

const POSITION_CLASSES: { [key: string]: string } = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
};

interface IProps {
  children: ReactElement[];
  position: string;
}

interface ILayerObj {
  layer: Layer;
  group: string;
  name: string;
  checked: boolean;
  id: number;
}

const LayerControl = ({ position, children }: IProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const [layers, setLayers] = useState<ILayerObj[]>([]);
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const map = useMapEvents({
    layerremove: () => {
      //console.log('layer removed');
    },
    layeradd: () => {
      //console.log('layer add');
    },
    overlayadd: () => {
      //console.log(layers);
    },
  });

  const onLayerClick = (layerObj: ILayerObj) => {
    if (map?.hasLayer(layerObj.layer)) {
      map.removeLayer(layerObj.layer);
      setLayers(
        layers.map((layer) => {
          if (layer.id === layerObj.id)
            return {
              ...layer,
              checked: false,
            };
          return layer;
        })
      );
    } else {
      map.addLayer(layerObj.layer);
      setLayers(
        layers.map((layer) => {
          if (layer.id === layerObj.id)
            return {
              ...layer,
              checked: true,
            };
          return layer;
        })
      );
    }
  };

  const onGroupAdd = (layer: Layer, name: string, group: string) => {
    const cLayers = layers;
    cLayers.push({
      layer,
      group,
      name,
      checked: map?.hasLayer(layer),
      id: Util.stamp(layer),
    });

    setLayers(cLayers);
  };

  const groupedLayers = lodashGroupBy(layers, 'group');

  return (
    <LayersControlProvider
      value={{
        layers,
        addGroup: onGroupAdd,
      }}
    >
      <div className={positionClass}>
        <div className="leaflet-control leaflet-bar">
          {
            <Paper
              onMouseEnter={() => setCollapsed(false)}
              onMouseLeave={() => setCollapsed(true)}
            >
              {collapsed && (
                <IconButton>
                  <LayersIcon fontSize="default" />
                </IconButton>
              )}
              {!collapsed &&
                Object.keys(groupedLayers).map((section, index) => (
                  <Accordion key={`${section} ${index}`}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>{section}</Typography>
                    </AccordionSummary>
                    {groupedLayers[section]?.map((layerObj, index) => (
                      <AccordionDetails key={`accDetails_${index}`}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={layerObj.checked}
                              onChange={() => onLayerClick(layerObj)}
                              name="checkedB"
                              color="primary"
                            />
                          }
                          label={layerObj.name}
                        />
                      </AccordionDetails>
                    ))}
                  </Accordion>
                ))}
            </Paper>
          }
        </div>
        {children}
      </div>
    </LayersControlProvider>
  );
};

const GroupedLayer = createControlledLayer(
  (layersControl, layer, name, group) => {
    layersControl.addGroup(layer, name, group);
  }
);

export default LayerControl;
export { GroupedLayer };
