import semver from "semver";
import { FIRST_RELEASE, FIRSTPRERELEASE } from "./definitions/constants.js";
import { getLatestVersion, highest, isSameChannel, tagsToVersions } from "./utils.js";

export default ({ branch, nextRelease: { info, channel }, lastRelease, logger }) => {
  let type = info.type;
  let version;
  if (lastRelease.version) {
    const { major, minor, patch } = semver.parse(lastRelease.version);

    if (branch.type === "prerelease") {
      if (
        semver.prerelease(lastRelease.version) &&
        lastRelease.channels.some((lastReleaseChannel) => isSameChannel(lastReleaseChannel, channel))
      ) {
        version = highest(
          semver.inc(lastRelease.version, "prerelease"),
          `${semver.inc(getLatestVersion(tagsToVersions(branch.tags), { withPrerelease: true }), type)}-${
            branch.prerelease
          }.${FIRSTPRERELEASE}`
        );
      } else {
        version = `${semver.inc(`${major}.${minor}.${patch}`, type)}-${branch.prerelease}.${FIRSTPRERELEASE}`;
      }
    } else {
      let versionTmp = lastRelease.version;
      for (const [incrementType, incrementAmount] of Object.entries(info.increments)) {
        range(incrementAmount).forEach(i => {
          versionTmp = semver.inc(versionTmp, incrementType);
        });
      }
      version = versionTmp;
    }

    logger.log("The next release version is %s", version);
  } else {
    version = branch.type === "prerelease" ? `${FIRST_RELEASE}-${branch.prerelease}.${FIRSTPRERELEASE}` : FIRST_RELEASE;
    logger.log(`There is no previous release, the next release version is ${version}`);
  }

  return version;
};
