using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Runtime.InteropServices.JavaScript;
using System.Linq;

namespace Steamworks
{
    partial class SteamJS
    {
        [JSImport("GetAchievement", "SteamJS")]
        public static partial bool GetAchievement(string achievement);
        [JSImport("SetAchievement", "SteamJS")]
        public static partial void SetAchievement(string achievement);

        [JSImport("GetStat", "SteamJS")]
        public static partial int GetStat(string stat);
        [JSImport("SetStat", "SteamJS")]
        public static partial void SetStat(string stat, int value);

		[JSImport("GetPersonaName", "SteamJS")]
		public static partial string GetPersonaName();
		[JSImport("GetLanguage", "SteamJS")]
		public static partial string GetLanguage();
    }

    public class SteamAPI
    {
        public static void RunCallbacks()
        {
        }

        public static bool RestartAppIfNecessary(AppId_t app)
        {
            return false;
        }

        public static bool Init()
        {
            return true;
        }
    }

    public class SteamApps
    {
        public static string GetCurrentGameLanguage()
        {
            return SteamJS.GetLanguage();
        }
    }

	public class SteamUtils
	{
		public static bool IsSteamRunningOnSteamDeck()
		{
			return false;
		}
	}

	public class SteamFriends
	{
		public static string GetPersonaName()
		{
			return SteamJS.GetPersonaName();
		}
	}

	public static class SteamInput {
		public static bool Init(bool bExplicityCallRunFrame) {
			return true;
		}

		public static bool Shutdown() {
			return true;
		}

		public static InputActionSetHandle_t GetActionSetHandle(string pszActionSetName) {
			return (InputActionSetHandle_t)0;
		}

		public static int GetConnectedControllers(InputHandle_t[] handlesOut) {
			return 0;
		}

		public static void ActivateActionSet(InputHandle_t inputHandle, InputActionSetHandle_t actionSetHandle) {}
		public static void EnableDeviceCallbacks() {}
		public static void RunFrame(bool bReservedValue = true) {}
	}

    public class SteamUserStats
    {
        public static bool GetAchievement(string achievement, out bool achieved)
        {
            achieved = SteamJS.GetAchievement(achievement);
            return true;
        }
        public static bool SetAchievement(string achievement)
        {
            SteamJS.SetAchievement(achievement);
            return true;
        }

        public static bool GetStat(string stat, out int val)
        {
            val = SteamJS.GetStat(stat);
            return true;
        }
        public static bool SetStat(string stat, int val)
        {
            SteamJS.SetStat(stat, val);
            return true;
        }
        public static bool GetGlobalStat(string stat, out long val)
        {
            val = SteamJS.GetStat(stat);
            return true;
        }
        public static bool StoreStats()
        {
            return true;
        }

        public static bool RequestCurrentStats()
        {
            return true;
        }
        public static SteamAPICall_t RequestGlobalStats(int param)
        {
            return SteamAPICall_t.Invalid;
        }
    }

    [System.Serializable]
    public struct SteamAPICall_t : System.IEquatable<SteamAPICall_t>, System.IComparable<SteamAPICall_t>
    {
        public static readonly SteamAPICall_t Invalid = new SteamAPICall_t(0x0);
        public ulong m_SteamAPICall;

        public SteamAPICall_t(ulong value)
        {
            m_SteamAPICall = value;
        }

        public override string ToString()
        {
            return m_SteamAPICall.ToString();
        }

        public override bool Equals(object other)
        {
            return other is SteamAPICall_t && this == (SteamAPICall_t)other;
        }

        public override int GetHashCode()
        {
            return m_SteamAPICall.GetHashCode();
        }

        public static bool operator ==(SteamAPICall_t x, SteamAPICall_t y)
        {
            return x.m_SteamAPICall == y.m_SteamAPICall;
        }

        public static bool operator !=(SteamAPICall_t x, SteamAPICall_t y)
        {
            return !(x == y);
        }

        public static explicit operator SteamAPICall_t(ulong value)
        {
            return new SteamAPICall_t(value);
        }

        public static explicit operator ulong(SteamAPICall_t that)
        {
            return that.m_SteamAPICall;
        }

        public bool Equals(SteamAPICall_t other)
        {
            return m_SteamAPICall == other.m_SteamAPICall;
        }

        public int CompareTo(SteamAPICall_t other)
        {
            return m_SteamAPICall.CompareTo(other.m_SteamAPICall);
        }
    }

    [System.Serializable]
    public struct AppId_t : System.IEquatable<AppId_t>, System.IComparable<AppId_t>
    {
        public static readonly AppId_t Invalid = new AppId_t(0x0);
        public uint m_AppId;

        public AppId_t(uint value)
        {
            m_AppId = value;
        }

        public override string ToString()
        {
            return m_AppId.ToString();
        }

        public override bool Equals(object other)
        {
            return other is AppId_t && this == (AppId_t)other;
        }

        public override int GetHashCode()
        {
            return m_AppId.GetHashCode();
        }

        public static bool operator ==(AppId_t x, AppId_t y)
        {
            return x.m_AppId == y.m_AppId;
        }

        public static bool operator !=(AppId_t x, AppId_t y)
        {
            return !(x == y);
        }

        public static explicit operator AppId_t(uint value)
        {
            return new AppId_t(value);
        }

        public static explicit operator uint(AppId_t that)
        {
            return that.m_AppId;
        }

        public bool Equals(AppId_t other)
        {
            return m_AppId == other.m_AppId;
        }

        public int CompareTo(AppId_t other)
        {
            return m_AppId.CompareTo(other.m_AppId);
        }
    }

	[System.Serializable]
	public struct InputHandle_t : System.IEquatable<InputHandle_t>, System.IComparable<InputHandle_t> {
		public ulong m_InputHandle;

		public InputHandle_t(ulong value) {
			m_InputHandle = value;
		}

		public override string ToString() {
			return m_InputHandle.ToString();
		}

		public override bool Equals(object other) {
			return other is InputHandle_t && this == (InputHandle_t)other;
		}

		public override int GetHashCode() {
			return m_InputHandle.GetHashCode();
		}

		public static bool operator ==(InputHandle_t x, InputHandle_t y) {
			return x.m_InputHandle == y.m_InputHandle;
		}

		public static bool operator !=(InputHandle_t x, InputHandle_t y) {
			return !(x == y);
		}

		public static explicit operator InputHandle_t(ulong value) {
			return new InputHandle_t(value);
		}

		public static explicit operator ulong(InputHandle_t that) {
			return that.m_InputHandle;
		}

		public bool Equals(InputHandle_t other) {
			return m_InputHandle == other.m_InputHandle;
		}

		public int CompareTo(InputHandle_t other) {
			return m_InputHandle.CompareTo(other.m_InputHandle);
		}
	}

	[System.Serializable]
	public struct InputActionSetHandle_t : System.IEquatable<InputActionSetHandle_t>, System.IComparable<InputActionSetHandle_t> {
		public ulong m_InputActionSetHandle;

		public InputActionSetHandle_t(ulong value) {
			m_InputActionSetHandle = value;
		}

		public override string ToString() {
			return m_InputActionSetHandle.ToString();
		}

		public override bool Equals(object other) {
			return other is InputActionSetHandle_t && this == (InputActionSetHandle_t)other;
		}

		public override int GetHashCode() {
			return m_InputActionSetHandle.GetHashCode();
		}

		public static bool operator ==(InputActionSetHandle_t x, InputActionSetHandle_t y) {
			return x.m_InputActionSetHandle == y.m_InputActionSetHandle;
		}

		public static bool operator !=(InputActionSetHandle_t x, InputActionSetHandle_t y) {
			return !(x == y);
		}

		public static explicit operator InputActionSetHandle_t(ulong value) {
			return new InputActionSetHandle_t(value);
		}

		public static explicit operator ulong(InputActionSetHandle_t that) {
			return that.m_InputActionSetHandle;
		}

		public bool Equals(InputActionSetHandle_t other) {
			return m_InputActionSetHandle == other.m_InputActionSetHandle;
		}

		public int CompareTo(InputActionSetHandle_t other) {
			return m_InputActionSetHandle.CompareTo(other.m_InputActionSetHandle);
		}
	}

	[System.Serializable]
	public struct InputAnalogActionHandle_t : System.IEquatable<InputAnalogActionHandle_t>, System.IComparable<InputAnalogActionHandle_t> {
		public ulong m_InputAnalogActionHandle;

		public InputAnalogActionHandle_t(ulong value) {
			m_InputAnalogActionHandle = value;
		}

		public override string ToString() {
			return m_InputAnalogActionHandle.ToString();
		}

		public override bool Equals(object other) {
			return other is InputAnalogActionHandle_t && this == (InputAnalogActionHandle_t)other;
		}

		public override int GetHashCode() {
			return m_InputAnalogActionHandle.GetHashCode();
		}

		public static bool operator ==(InputAnalogActionHandle_t x, InputAnalogActionHandle_t y) {
			return x.m_InputAnalogActionHandle == y.m_InputAnalogActionHandle;
		}

		public static bool operator !=(InputAnalogActionHandle_t x, InputAnalogActionHandle_t y) {
			return !(x == y);
		}

		public static explicit operator InputAnalogActionHandle_t(ulong value) {
			return new InputAnalogActionHandle_t(value);
		}

		public static explicit operator ulong(InputAnalogActionHandle_t that) {
			return that.m_InputAnalogActionHandle;
		}

		public bool Equals(InputAnalogActionHandle_t other) {
			return m_InputAnalogActionHandle == other.m_InputAnalogActionHandle;
		}

		public int CompareTo(InputAnalogActionHandle_t other) {
			return m_InputAnalogActionHandle.CompareTo(other.m_InputAnalogActionHandle);
		}
	}

	[System.Serializable]
	public struct InputDigitalActionHandle_t : System.IEquatable<InputDigitalActionHandle_t>, System.IComparable<InputDigitalActionHandle_t> {
		public ulong m_InputDigitalActionHandle;

		public InputDigitalActionHandle_t(ulong value) {
			m_InputDigitalActionHandle = value;
		}

		public override string ToString() {
			return m_InputDigitalActionHandle.ToString();
		}

		public override bool Equals(object other) {
			return other is InputDigitalActionHandle_t && this == (InputDigitalActionHandle_t)other;
		}

		public override int GetHashCode() {
			return m_InputDigitalActionHandle.GetHashCode();
		}

		public static bool operator ==(InputDigitalActionHandle_t x, InputDigitalActionHandle_t y) {
			return x.m_InputDigitalActionHandle == y.m_InputDigitalActionHandle;
		}

		public static bool operator !=(InputDigitalActionHandle_t x, InputDigitalActionHandle_t y) {
			return !(x == y);
		}

		public static explicit operator InputDigitalActionHandle_t(ulong value) {
			return new InputDigitalActionHandle_t(value);
		}

		public static explicit operator ulong(InputDigitalActionHandle_t that) {
			return that.m_InputDigitalActionHandle;
		}

		public bool Equals(InputDigitalActionHandle_t other) {
			return m_InputDigitalActionHandle == other.m_InputDigitalActionHandle;
		}

		public int CompareTo(InputDigitalActionHandle_t other) {
			return m_InputDigitalActionHandle.CompareTo(other.m_InputDigitalActionHandle);
		}
	}
}
