/* ==========================================================================
   Skill Badges – Transform comma-separated skill lists into tag badges
   Only activates on pages with .work.page
   ========================================================================== */

(function () {
  "use strict";

  if (!document.querySelector(".work.page")) return;

  var categoryMap = {
    // German
    "Am besten": "best",
    "Lerne ich gerade": "learning",
    Stark: "strong",
    "Lange her": "old",
    // English
    "Best at": "best",
    "Currently learning": "learning",
    Strong: "strong",
    "Long ago": "old",
  };

  var skillsHeadings = ["Was ich kann", "What I can do"];

  function findSkillsHeading() {
    var headings = document.querySelectorAll(".work.page h2");
    for (var i = 0; i < headings.length; i++) {
      var text = headings[i].textContent.trim();
      for (var j = 0; j < skillsHeadings.length; j++) {
        if (text.indexOf(skillsHeadings[j]) !== -1) {
          return headings[i];
        }
      }
    }
    return null;
  }

  /**
   * Split a string on commas, but not commas inside parentheses.
   * e.g. "Linux-Administration (Red Hat/CentOS, Debian, NixOS, Ubuntu), Shell-Power-Tools (Fish, direnv)"
   * => ["Linux-Administration (Red Hat/CentOS, Debian, NixOS, Ubuntu)", "Shell-Power-Tools (Fish, direnv)"]
   */
  function splitSkills(text) {
    var results = [];
    var current = "";
    var depth = 0;

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === "(") {
        depth++;
        current += ch;
      } else if (ch === ")") {
        depth = Math.max(0, depth - 1);
        current += ch;
      } else if (ch === "," && depth === 0) {
        results.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }

    if (current.trim().length > 0) {
      results.push(current.trim());
    }

    return results;
  }

  function transformSkills() {
    var h2 = findSkillsHeading();
    if (!h2) return;

    var sibling = h2.nextElementSibling;
    while (sibling && sibling.tagName !== "H2") {
      var next = sibling.nextElementSibling;

      if (sibling.tagName === "P" && sibling.textContent.indexOf(":") !== -1) {
        transformParagraph(sibling);
      }

      sibling = next;
    }
  }

  function transformParagraph(p) {
    var fullText = p.textContent;
    var colonIdx = fullText.indexOf(":");
    if (colonIdx === -1) return;

    var categoryLabel = fullText.substring(0, colonIdx).trim();
    var categoryClass = categoryMap[categoryLabel];
    if (!categoryClass) return;

    var skillsText = fullText.substring(colonIdx + 1).trim();
    // Remove trailing ellipsis, periods, commas
    skillsText = skillsText.replace(/[,\s…\.]+$/, "");

    var skills = splitSkills(skillsText).filter(function (s) {
      return s.length > 0 && s !== "…";
    });

    if (skills.length === 0) return;

    var container = document.createElement("div");
    container.className = "skill-badges";

    var label = document.createElement("strong");
    label.textContent = categoryLabel + ": ";
    container.appendChild(label);

    skills.forEach(function (skill) {
      var badge = document.createElement("span");
      badge.className = "skill-badge skill-" + categoryClass;
      badge.textContent = skill;
      container.appendChild(badge);
    });

    p.parentNode.replaceChild(container, p);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", transformSkills);
  } else {
    transformSkills();
  }
})();
