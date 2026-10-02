// v3's leader screens share v2's school memory (one store, one set of
// listeners), so the shell's top bar, which reads v2's, and a v3 screen
// never disagree about which school is open.
export { useLeaderSchoolId, useFromDistrict, openSchoolFromDistrict, backToDistrict } from "../../v2/leader/context";
