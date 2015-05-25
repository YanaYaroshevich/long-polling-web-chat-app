package bsu.famcs.chat.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class IdStorage {
	private static final List<String> INSTANSE = Collections.synchronizedList(new ArrayList<String>());

	private IdStorage() {}

	public static List<String> getStorage() { return INSTANSE; }

	public static void addId(String id) { INSTANSE.add(id); }

	public static void addAll(String[] ids) { INSTANSE.addAll(Arrays.asList(ids)); }

	public static void addAll(List<String> ids) { INSTANSE.addAll(ids); }

	public static int getSize() {
		return INSTANSE.size();
	}

	public static List<String> getSubIdsByIndex(int index) { return INSTANSE.subList(index, INSTANSE.size()); }
}