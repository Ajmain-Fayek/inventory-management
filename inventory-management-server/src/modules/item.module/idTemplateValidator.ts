import { AppError } from "@/errorHelper/AppError.js";
import status from "http-status";

interface TResolvedTemplate {
  fixedValueState: boolean;
  fixedValue: string | null;
  fixedPosition: number | null;
  sequenceValueState: boolean;
  sequenceValue: number | null;
  sequenceValuePosition: number | null;
  randomValueState: boolean;
  randomValue: string | null;
  randomValuePosition: number | null;
  datetimeValueState: boolean;
  datetimeValue: string | null;
  datetimeValuePosition: number | null;
}

export const validateResolvedIdTemplate = (template: TResolvedTemplate) => {
  const enabledComponents = [
    {
      state: template.fixedValueState,
      value: template.fixedValue,
      position: template.fixedPosition,
      name: "fixedValue",
    },
    {
      state: template.sequenceValueState,
      value: template.sequenceValue,
      position: template.sequenceValuePosition,
      name: "sequenceValue",
    },
    {
      state: template.randomValueState,
      value: template.randomValue,
      position: template.randomValuePosition,
      name: "randomValue",
    },
    {
      state: template.datetimeValueState,
      value: template.datetimeValue,
      position: template.datetimeValuePosition,
      name: "datetimeValue",
    },
  ].filter((component) => component.state);

  if (enabledComponents.length === 0) {
    throw new AppError("At least one ID template component must be enabled", status.BAD_REQUEST);
  }

  const seenPositions = new Set<number>();
  for (const component of enabledComponents) {
    if (component.value === null || component.value === undefined || component.value === "") {
      throw new AppError(`${component.name} is required for enabled template components`, status.BAD_REQUEST);
    }

    if (component.position === null || component.position === undefined) {
      throw new AppError(
        `${component.name} position is required for enabled template components`,
        status.BAD_REQUEST,
      );
    }

    if (seenPositions.has(component.position)) {
      throw new AppError("ID template contains duplicate positions", status.BAD_REQUEST);
    }

    seenPositions.add(component.position);
  }
};
