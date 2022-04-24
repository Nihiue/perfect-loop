local function Trigger(event, ...)
	local triggers = {GetFramesRegisteredForEvent("UNIT_ATTACK_SPEED")}
	for _,f in pairs(triggers) do 
		local n = f:GetName()
		if not n or not issecurevariable(_G, n) then
			local scr = f:GetScript("OnEvent")
			if scr then 
				scr(f, event, ...)
			end
		end
	end
end

if (UNIT_ATTACK_SPEED_PATCH_VERSION or 0) < 1 then
	UNIT_ATTACK_SPEED_PATCH_VERSION = 1
	
	local frame = CreateFrame("Frame")
	local timeElapsed = 0
	local mainSpeed, offSpeed = {}, {}
	local event = "UNIT_ATTACK_SPEED"
	frame:HookScript("OnUpdate", function(self, elapsed)
		timeElapsed = timeElapsed + elapsed
		if timeElapsed > 0.02 then
			timeElapsed = 0
			for _,unit in pairs({"player", "target"}) do 
				local main, off = UnitAttackSpeed(unit)
				if main ~= mainSpeed[unit] or off ~= offSpeed[unit] then
					mainSpeed[unit] = main
					offSpeed[unit] = off
					Trigger(event, unit)
				end
			end
		end
	end)
end


