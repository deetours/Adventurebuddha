import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SeatMapRenderer } from './SeatMapRenderer';
import type { SeatMap } from '../../lib/types';

const meta: Meta<typeof SeatMapRenderer> = {
  title: 'Components/SeatMapRenderer',
  component: SeatMapRenderer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSeatMap: SeatMap = {
  vehicle: 'Tempo Traveller',
  rows: 4,
  cols: 3,
  seats: [
    // Row 1 (Driver row)
  { id: 'D0', row: 1, col: 1, type: 'driver' as const },
  { id: 'A1', row: 1, col: 2, type: 'window' as const },
  { id: 'A2', row: 1, col: 3, type: 'aisle' as const },
    // Row 2
  { id: 'B1', row: 2, col: 1, type: 'window' as const },
  { id: 'B2', row: 2, col: 2, type: 'aisle' as const },
  { id: 'B3', row: 2, col: 3, type: 'window' as const },
    // Row 3
  { id: 'C1', row: 3, col: 1, type: 'window' as const, priceDelta: 200 },
  { id: 'C2', row: 3, col: 2, type: 'extra_legroom' as const, priceDelta: 500 },
  { id: 'C3', row: 3, col: 3, type: 'window' as const },
    // Row 4
  { id: 'D1', row: 4, col: 1, type: 'window' as const },
  { id: 'D2', row: 4, col: 2, type: 'aisle' as const },
  { id: 'D3', row: 4, col: 3, type: 'window' as const },
  ]
};

export const Default: Story = {
  args: {
    seatMap: sampleSeatMap,
  },
  decorators: [
    (Story) => {
      return React.createElement(
        "div",
        { className: "w-full max-w-md" },
        React.createElement(Story, null)
      );
    },
  ],
};

export const BusLayout: Story = {
  args: {
    seatMap: {
      vehicle: 'AC Bus',
      rows: 10,
      cols: 4,
      seats: Array.from({ length: 40 }, function(_: unknown, i: number) {
        return {
          id: `S${i + 1}`,
          row: Math.floor(i / 4) + 1,
          col: (i % 4) + 1,
          type: (i % 4 === 0 || i % 4 === 3) ? 'window' : 'aisle',
        };
      })
    },
  },
  decorators: [
    (Story) => {
      return React.createElement(
        "div",
        { className: "w-full max-w-md" },
        React.createElement(Story, null)
      );
    },
  ],
};