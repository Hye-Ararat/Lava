import { readFileSync } from "fs";
import http from "http";
import hyexd from "hyexd";







/**
 * 
 * @type {hyexd}
 */
export let LXDclient = new hyexd.default("unix:///var/lib/incus/unix.socket");
