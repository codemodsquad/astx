"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isEmpty;

function isEmpty(obj) {
  for (var key in obj) {
    return false;
  }

  return true;
}