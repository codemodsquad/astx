"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = mapValues;

function mapValues(obj, mapper) {
  var mapped = {};

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      mapped[key] = mapper(obj[key]);
    }
  }

  return mapped;
}