import React, { useEffect, useState } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { safeJsonParse } from "@/utils/request";
import { isPathMatch } from "@/utils/paths";
import useScrollActiveItemIntoView from "@/hooks/useScrollActiveItemIntoView";

export default function MenuOption({
  btnText,
  icon,
  href,
  childOptions = [],
  flex = false,
  user = null,
  roles = [],
  hidden = false,
  isChild = false,
}) {
  const storageKey = generateStorageKey({ key: btnText });
  const location = useLocation();
  const hasChildren = childOptions.length > 0;
  const hasVisibleChildren = hasVisibleOptions(user, childOptions);
  const { isExpanded, setIsExpanded } = useIsExpanded({
    storageKey,
    hasVisibleChildren,
    childOptions,
    location: location.pathname,
  });

  const isActive = hasChildren
    ? (!isExpanded &&
        childOptions.some((child) =>
          isPathMatch(child.href, location.pathname)
        )) ||
      location.pathname === href
    : isPathMatch(href, location.pathname);

  const { ref } = useScrollActiveItemIntoView({
    isActive,
    behavior: "instant",
    block: "center",
  });

  if (hidden) return null;

  // If this option is a parent level option
  if (!isChild) {
    // and has no children check roles
    if (!hasChildren) {
      if (!flex && user?.role && roles.length > 0 && !roles.includes(user.role))
        return null;
    }

    // if has children and no visible children - remove it.
    if (hasChildren && !hasVisibleChildren) return null;
  } else {
    // is a child so check permissions
    if (!flex && user?.role && roles.length > 0 && !roles.includes(user.role))
      return null;
  }

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);
      localStorage.setItem(storageKey, JSON.stringify(newExpandedState));
    }
  };

  return (
    <div className="relative">
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#14B8A6]" />
      )}
      <div
        className={`
          flex items-center justify-between w-full
          transition-all duration-200
          rounded-lg my-0.5
          ${
            isActive
              ? "bg-[#14B8A6]/10 light:bg-[#14B8A6]/15 text-[#14B8A6] font-medium"
              : "text-[#94A3B8] light:text-[#475569] hover:bg-white/5 light:hover:bg-slate-100 hover:text-white light:hover:text-[#0F172A]"
          }
        `}
      >
        <Link
          ref={ref}
          to={href}
          className={`flex flex-grow items-center px-3 h-9 font-medium ${
            isActive ? "text-[#14B8A6]" : ""
          }`}
          onClick={hasChildren ? handleClick : undefined}
        >
          {icon && (
            <div
              className={`mr-2.5 flex items-center justify-center ${isActive ? "text-[#14B8A6]" : "text-[#94A3B8] light:text-[#475569]"}`}
            >
              {icon}
            </div>
          )}
          <p
            className={`${
              isChild ? "text-xs" : "text-sm"
            } leading-loose whitespace-nowrap overflow-hidden ${
              isActive ? "text-[#14B8A6] font-semibold" : ""
            } ${!icon && "pl-5"}`}
          >
            {btnText}
          </p>
        </Link>
        {hasChildren && (
          <button onClick={handleClick} className="p-2 text-inherit">
            <CaretRight
              size={14}
              weight="bold"
              className={`transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        )}
      </div>
      {isExpanded && hasChildren && (
        <div className="mt-0.5 pl-3 w-full border-l border-white/10 light:border-slate-200 ml-3">
          {childOptions.map((childOption, index) => (
            <MenuOption
              key={index}
              {...childOption}
              user={user}
              isChild={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function useIsExpanded({
  storageKey = "",
  hasVisibleChildren = false,
  childOptions = [],
  location = null,
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (hasVisibleChildren) {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue !== null) {
        return safeJsonParse(storedValue, false);
      }
      return childOptions.some((child) => isPathMatch(child.href, location));
    }
    return false;
  });

  useEffect(() => {
    if (hasVisibleChildren) {
      const shouldExpand = childOptions.some((child) =>
        isPathMatch(child.href, location)
      );
      if (shouldExpand && !isExpanded) {
        setIsExpanded(true);
        localStorage.setItem(storageKey, JSON.stringify(true));
      }
    }
  }, [location]);

  return { isExpanded, setIsExpanded };
}

/**
 * Checks if the child options are visible to the user.
 * This hides the top level options if the child options are not visible
 * for either the users permissions or the child options hidden prop is set to true by other means.
 * If all child options return false for `isVisible` then the parent option will not be visible as well.
 * @param {object} user - The user object.
 * @param {array} childOptions - The child options.
 * @returns {boolean} - True if the child options are visible, false otherwise.
 */
function hasVisibleOptions(user = null, childOptions = []) {
  if (!Array.isArray(childOptions) || childOptions?.length === 0) return false;

  function isVisible({
    roles = [],
    user = null,
    flex = false,
    hidden = false,
  }) {
    if (hidden) return false;
    if (!flex && user?.role && roles.length > 0 && !roles.includes(user.role))
      return false;
    return true;
  }

  return childOptions.some((opt) =>
    isVisible({ roles: opt.roles, user, flex: opt.flex, hidden: opt.hidden })
  );
}

function generateStorageKey({ key = "" }) {
  const _key = key.replace(/\s+/g, "_").toLowerCase();
  return `ContextIQ_menu_${_key}_expanded`;
}
