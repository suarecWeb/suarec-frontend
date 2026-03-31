"use client";
import { sileo, SileoPosition } from "sileo";

export const useSileo = () => {
  const success = (
    title: string,
    description?: string,
    position?: SileoPosition,
  ) => {
    sileo.success({ title, description, position, duration: 2500 });
  };

  const error = (
    title: string,
    description?: string,
    position?: SileoPosition,
  ) => {
    sileo.error({ title, description, position, duration: 2500 });
  };

  const info = (
    title: string,
    description?: string,
    position?: SileoPosition,
  ) => {
    sileo.info({ title, description, position, duration: 2500 });
  };

  const warning = (
    title: string,
    description?: string,
    position?: SileoPosition,
  ) => {
    sileo.warning({ title, description, position, duration: 2500 });
  };

  return { success, error, info, warning };
};
